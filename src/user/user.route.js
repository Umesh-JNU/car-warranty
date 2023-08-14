const express = require("express");
const router = express.Router();
const { auth } = require("../../middlewares/auth");
const { createUser, getAllUser, getUser, updateUser, deleteUser, login, updateProfile, updatePassword } = require("./user.controller");

router.post("/register", createUser);
router.post("/login", login);
router.get("/profile", auth, getUser);
router.put("/update-profile", auth, updateProfile);
router.put("/update-password", auth, updatePassword);

router.get("/", getAllUser);
router.route("/:id")
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
