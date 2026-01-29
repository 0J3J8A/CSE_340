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

/* ***************************
 *  Build inventory management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
      messages: req.flash()
    })
  } catch (error) {
    console.error("Error in buildManagement:", error)
    next(error)
  }
}

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    res.render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null,
      classification_name: '',
      messages: req.flash()
    })
  } catch (error) {
    console.error("Error in buildAddClassification:", error)
    next(error)
  }
}

/* ***************************
 *  Process new classification
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  try {
    const { classification_name } = req.body
    const errors = []
    
    // Server-side validation
    const validationErrors = utilities.validateClassification(classification_name)
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => errors.push({msg: error}))
    }
    
    if (errors.length > 0) {
      let nav = await utilities.getNav()
      return res.render("./inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors,
        classification_name,
        messages: req.flash()
      })
    }
    
    // Add to database
    const result = await invModel.addClassification(classification_name.trim())
    
    if (result) {
      // Success - refresh navigation and redirect to management
      req.flash('success', `Classification "${classification_name}" was successfully added.`)
      res.redirect('/inv/')
    } else {
      throw new Error('Failed to add classification')
    }
    
  } catch (error) {
    console.error("Error in addClassification:", error)
    
    // Handle duplicate classification name
    if (error.message && error.message.includes('duplicate key value') || 
        (error.code && error.code === '23505')) {
      let nav = await utilities.getNav()
      req.flash('error', 'This classification name already exists.')
      res.render("./inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: [{msg: 'Classification name already exists.'}],
        classification_name: req.body.classification_name,
        messages: req.flash()
      })
    } else {
      next(error)
    }
  }
}

/* ***************************
 *  Build add inventory view
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList()
    
    res.render("./inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      errors: null,
      invData: {
        inv_make: '',
        inv_model: '',
        inv_year: '',
        inv_description: '',
        inv_image: '/images/vehicles/no-image.png',
        inv_thumbnail: '/images/vehicles/no-image-tn.png',
        inv_price: '',
        inv_miles: '',
        inv_color: '',
        classification_id: ''
      },
      messages: req.flash()
    })
  } catch (error) {
    console.error("Error in buildAddInventory:", error)
    next(error)
  }
}

/* ***************************
 *  Process new inventory item
 * ************************** */
invCont.addInventory = async function (req, res, next) {
  try {
    const { 
      inv_make, 
      inv_model, 
      inv_year, 
      inv_description,
      inv_image, 
      inv_thumbnail, 
      inv_price, 
      inv_miles, 
      inv_color, 
      classification_id 
    } = req.body
    
    const invData = {
      inv_make: inv_make || '',
      inv_model: inv_model || '',
      inv_year: inv_year || '',
      inv_description: inv_description || '',
      inv_image: inv_image || '/images/vehicles/no-image.png',
      inv_thumbnail: inv_thumbnail || '/images/vehicles/no-image-tn.png',
      inv_price: inv_price || '',
      inv_miles: inv_miles || '',
      inv_color: inv_color || '',
      classification_id: classification_id || ''
    }
    
    const errors = []
    
    // Server-side validation
    const validationErrors = utilities.validateInventory(invData)
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => errors.push({msg: error}))
    }
    
    if (errors.length > 0) {
      let nav = await utilities.getNav()
      let classificationList = await utilities.buildClassificationList(classification_id)
      
      return res.render("./inventory/add-inventory", {
        title: "Add New Vehicle",
        nav,
        classificationList,
        errors,
        invData,
        messages: req.flash()
      })
    }
    
    // Convert price and miles to numbers
    invData.inv_price = parseFloat(invData.inv_price)
    invData.inv_miles = parseInt(invData.inv_miles)
    invData.classification_id = parseInt(invData.classification_id)
    
    // Add to database
    const result = await invModel.addInventory(invData)
    
    if (result) {
      // Success - redirect to management view with success message
      req.flash('success', `Vehicle "${invData.inv_make} ${invData.inv_model}" was successfully added.`)
      res.redirect('/inv/')
    } else {
      throw new Error('Failed to add inventory item')
    }
    
  } catch (error) {
    console.error("Error in addInventory:", error)
    
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList(req.body.classification_id)
    
    req.flash('error', 'Failed to add vehicle. Please try again.')
    res.render("./inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      errors: [{msg: 'Failed to add vehicle. Please try again.'}],
      invData: req.body,
      messages: req.flash()
    })
  }
}

module.exports = invCont