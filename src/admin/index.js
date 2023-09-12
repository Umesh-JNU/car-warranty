const express = require("express");
const router = express.Router();
const { auth, authRole } = require("../../middlewares/auth");
const { upload } = require("../../utils/s3");

const { postSingleImage, getStatistics } = require("./adminController")

const { createSalePerson, deleteSalePerson, getAllUser, getUser, updateUser, deleteUser } = require("../user");
const { getAllWarranty, getWarranty, updateWarranty, deleteWarranty } = require("../warranty");
const { getAllTransaction, getTransaction, deleteTransaction, updateTransaction } = require("../transaction");
const { deleteEnquiry, getEnquiry, getAllEnquiry, updateEnquiry } = require("../enquiry");


router.post("/sale-person", auth, authRole('admin'), createSalePerson);
router.delete("/sale-person/:id", auth, authRole('admin'), deleteSalePerson)

router.get("/users", auth, authRole('admin'), getAllUser);
router.route("/user/:id")
  .get(auth, authRole('admin'), getUser)
  .put(auth, authRole('admin'), updateUser)
  .delete(auth, authRole('admin'), deleteUser);


router.get("/warranty", auth, authRole('admin'), getAllWarranty);
router.route("/warranty/:id")
  .get(auth, authRole("admin"), getWarranty)
  .put(auth, authRole(['admin', 'sale-person']), updateWarranty)
  .delete(auth, authRole('admin'), deleteWarranty);

router.get("/transactions", auth, authRole('admin'), getAllTransaction);
router.route("/transaction/:id")
  .get(auth, authRole("admin"), getTransaction)
  .put(auth, authRole('admin'), updateTransaction)
  .delete(auth, authRole('admin'), deleteTransaction);

router.get("/enquiry", auth, authRole('admin'), getAllEnquiry);
router.route("/enquiry/:id")
  .get(auth, authRole("admin"), getEnquiry)
  .put(auth, authRole('admin'), updateEnquiry)
  .delete(auth, authRole('admin'), deleteEnquiry);

router.post("/image", auth, authRole('admin'), upload.single('image'), postSingleImage);

router.get('/statistics/:time', auth, authRole('admin'), getStatistics);
module.exports = router;
