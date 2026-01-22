// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build inventory item detail view
router.get("/detail/:inventoryId", invController.buildByInventoryId);

// Route to trigger intentional 500 error
router.get("/trigger-error", invController.triggerIntentionalError);

module.exports = router;