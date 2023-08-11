const express = require("express");
const router = express.Router();
const { auth } = require("../../middlewares/auth");
const { createLevel, getAllLevel, getLevel, updateLevel, deleteLevel, createPlan, getLevelSuggestion } = require("./level.controller");

router.post("/", createLevel);
router.get("/", getAllLevel);

router.route("/plan").post(createPlan).get(getLevelSuggestion);

router.route("/:id")
.get(getLevel)
.put(updateLevel)
.delete(deleteLevel);



module.exports = router;
