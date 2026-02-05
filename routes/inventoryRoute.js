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

// Route to build inventory management view (Employee/Admin only)
router.get("/", 
  utilities.checkLogin, 
  utilities.requireEmployeeOrAdmin, 
  utilities.handleErrors(invController.buildManagement)
)

// Route to build add classification view (Employee/Admin only)
router.get("/add-classification", 
  utilities.checkLogin, 
  utilities.requireEmployeeOrAdmin, 
  utilities.handleErrors(invController.buildAddClassification)
)

// Route to process classification (Employee/Admin only)
router.post("/add-classification", 
  utilities.checkLogin, 
  utilities.requireEmployeeOrAdmin, 
  utilities.handleErrors(invController.addClassification)
)

// Route to build add inventory view (Employee/Admin only)
router.get("/add-inventory", 
  utilities.checkLogin, 
  utilities.requireEmployeeOrAdmin, 
  utilities.handleErrors(invController.buildAddInventory)
)

// Route to process inventory item (Employee/Admin only)
router.post("/add-inventory", 
  utilities.checkLogin, 
  utilities.requireEmployeeOrAdmin, 
  utilities.handleErrors(invController.addInventory)
)

// Route to get inventory by classification as JSON (Employee/Admin only)
router.get("/getInventory/:classification_id", 
  utilities.checkLogin, 
  utilities.requireEmployeeOrAdmin, 
  utilities.handleErrors(invController.getInventoryJSON)
)

// Route to build edit inventory view (Employee/Admin only)
router.get("/edit/:inv_id", 
  utilities.checkLogin, 
  utilities.requireEmployeeOrAdmin, 
  utilities.handleErrors(invController.editInventoryView)
)

// Route to update inventory item with validation middleware (Employee/Admin only)
router.post("/update", 
  utilities.checkLogin,
  utilities.requireEmployeeOrAdmin,
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)

// Route to build delete confirmation view (Employee/Admin only)
router.get("/delete/:inv_id", 
  utilities.checkLogin, 
  utilities.requireEmployeeOrAdmin, 
  utilities.handleErrors(invController.buildDeleteConfirmationView)
)

// Route to process inventory item deletion (Employee/Admin only)
router.post("/delete", 
  utilities.checkLogin, 
  utilities.requireEmployeeOrAdmin, 
  utilities.handleErrors(invController.deleteInventoryItem)
)

module.exports = router