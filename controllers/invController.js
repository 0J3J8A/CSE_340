const invModel = require("../models/inventory-model")
const utilities = require("../utilities")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    
    if (!data || data.length === 0) {
      throw new Error("No vehicles found for this classification")
    }
    
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    })
  } catch (error) {
    console.error("Error in buildByClassificationId:", error)
    next(error)
  }
}

/* ***************************
 *  Build inventory item detail view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  try {
    const inventory_id = req.params.inventoryId
    const data = await invModel.getInventoryById(inventory_id)
    
    if (data) {
      const vehicleHTML = await utilities.buildVehicleDetailHTML(data)
      let nav = await utilities.getNav()
      res.render("./inventory/detail", {
        title: `${data.inv_make} ${data.inv_model}`,
        nav,
        vehicleHTML,
      })
    } else {
      // Vehicle not found - create a 404 error
      const error = new Error("Vehicle not found")
      error.status = 404
      next(error)
    }
  } catch (error) {
    console.error("Error in buildByInventoryId:", error)
    next(error)
  }
}

/* ***************************
 *  Trigger intentional 500 error
 * ************************** */
invCont.triggerIntentionalError = async function (req, res, next) {
  try {
    // Intentionally throw an error to test error handling
    throw new Error("Intentional 500 Server Error - This is a test error to demonstrate error handling.")
  } catch (error) {
    // Log the error and pass it to the error handler
    console.error("Intentional error triggered:", error.message)
    error.status = 500
    next(error)
  }
}

module.exports = invCont