const jwt = require("jsonwebtoken");
require("dotenv").config();
const SECRET = process.env.JWT_SECRET;

module.exports = {
  verifyUser: (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.redirect('/');
    }
    
    try {
      const decoded = jwt.verify(token, SECRET);
      
      if (decoded.id != req.params.userId) {
        return res.redirect('/');
        console.log("Unauthorized access " + new Date())
      }
      console.log("Verified " + new Date())
      next();
    } catch (err) {
      console.log("Bad or expired token " + new Date())
      return res.redirect('/');
    }
  },

  verifyCaretaker:(req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.redirect('/');
    }
    
    try {
      const decoded = jwt.verify(token, SECRET);
      
      if (decoded.id != req.params.caretakerId) {
      console.log("Unauthorized caretaker access " + new Date())

        return res.redirect('/');
      }
      console.log("Verified caretaker " + new Date())
      next();
    } catch (err) {
      console.log("Bad or expired token " + new Date())
      return res.redirect('/');
    }
  },

};
