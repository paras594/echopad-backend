const express = require("express");
const router = express.Router();
const userContentController = require("../controllers/user-content.controller");

router.get("/", userContentController.getUserContent);
router.post("/", userContentController.updateUserContent);

module.exports = router;
