const express = require("express");
const MedicinesController = require("../controllers/MedicinesController");

const router = express.Router();

router.get("/:userId/medicines", MedicinesController.getAll);
router.get("/:userId/medicines/:medicineId", MedicinesController.getOne);
router.post("/:userId/medicines", MedicinesController.create);
router.put("/:userId/medicines/:medicineId", MedicinesController.update);
router.delete("/:userId/medicines/:medicineId", MedicinesController.delete);
router.delete("/:userId/medicines", MedicinesController.deleteMultiple);

module.exports = router;
