const express = require("express");
const router = express.Router();
const { auth, authRole } = require("../../middlewares/auth");

const { createSalePerson, getAllUser, getUser, updateUser, deleteUser } = require("../user");
const { getAllWarranty, getWarranty, updateWarranty } = require("../warranty");


router.post("/sale-person", auth, authRole('admin'), createSalePerson);

router.get("/users", auth, authRole('admin'), getAllUser);
router.route("/user/:id")
  .get(auth, authRole('admin'), getUser)
  .put(auth, authRole('admin'), updateUser)
  .delete(auth, authRole('admin'), deleteUser);


router.get("/warranty", auth, authRole('admin'), getAllWarranty);
router.route("/warranty/:id").get(auth, authRole("admin"), getWarranty).put(auth, authRole('admin'), updateWarranty);

module.exports = router;
