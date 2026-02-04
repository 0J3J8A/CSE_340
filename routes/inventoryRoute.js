// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const invValidate = require('../utilities/inventory-validation')

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

// Route to get inventory by classification as JSON
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// Route to build edit inventory view
router.get("/edit/:inv_id", utilities.handleErrors(invController.editInventoryView))

// Route to update inventory item with validation middleware
router.post("/update", 
    invValidate.inventoryRules(),
    invValidate.checkUpdateData,
    utilities.handleErrors(invController.updateInventory)
)

// Route to build delete confirmation view
router.get("/delete/:inv_id", utilities.handleErrors(invController.buildDeleteConfirmationView))

// Route to process inventory item deletion
router.post("/delete", utilities.handleErrors(invController.deleteInventoryItem))

module.exports = router