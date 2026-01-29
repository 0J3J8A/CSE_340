// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))

// Route to build inventory item detail view
router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildByInventoryId))

// Route to trigger intentional 500 error
router.get("/trigger-error", utilities.handleErrors(invController.triggerIntentionalError))

// Route to build inventory management view
router.get("/", utilities.handleErrors(invController.buildManagement))

// Route to build add classification view
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification))

// Route to process classification
router.post("/add-classification", utilities.handleErrors(invController.addClassification))

// Route to build add inventory view
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory))

// Route to process inventory item
router.post("/add-inventory", utilities.handleErrors(invController.addInventory))

module.exports = router