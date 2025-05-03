const jwt = require("jsonwebtoken");
require("dotenv").config();
const SECRET = process.env.JWT_SECRET;

module.exports = {
  verifyUser: (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ error: "Authentication token is required" });
    }
    
    try {
      const decoded = jwt.verify(token, SECRET);
      
      if (decoded.id != req.params.userId) {
        console.log("Unauthorized access " + new Date());
        return res.status(403).json({ error: "Unauthorized access" });
      }
      next();
    } catch (err) {
      console.log("Bad or expired token " + new Date());
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  },

  verifyCaretaker:(req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Authentication token is required" });
    }
    
    try {
      const decoded = jwt.verify(token, SECRET);
      
      if (decoded.id != req.params.caretakerId) {
        console.log("Unauthorized caretaker access " + new Date());
        return res.status(403).json({ error: "Unauthorized access" });
      }
      next();
    } catch (err) {
      console.log("Bad or expired token " + new Date());
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  },

};
