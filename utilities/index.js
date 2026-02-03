const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  try {
    let data = await invModel.getClassifications()
    let list = "<ul>"
    list += '<li><a href="/" title="Home page">Home</a></li>'
    data.rows.forEach((row) => {
      list += "<li>"
      list +=
        '<a href="/inv/type/' +
        row.classification_id +
        '" title="See our inventory of ' +
        row.classification_name +
        ' vehicles">' +
        row.classification_name +
        "</a>"
      list += "</li>"
    })
    list += "</ul>"
    return list
  } catch (error) {
    console.error("Error getting navigation:", error)
    // Return basic navigation if there's an error
    return '<ul><li><a href="/" title="Home page">Home</a></li></ul>'
  }
}

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function(data){
  try {
    let grid
    if(data && data.length > 0){
      grid = '<ul id="inv-display">'
      data.forEach(vehicle => { 
        // Get the thumbnail filename ONLY
        let thumbnailSrc = vehicle.inv_thumbnail
        
        // Extract just the filename (after the last slash)
        const lastSlashIndex = thumbnailSrc.lastIndexOf('/')
        if (lastSlashIndex !== -1) {
          thumbnailSrc = thumbnailSrc.substring(lastSlashIndex + 1)
        }
        
        // Now build the correct path with ONLY ONE "vehicles/"
        thumbnailSrc = '/images/vehicles/' + thumbnailSrc
        
        grid += '<li>'
        grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
        + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
        + 'details"><img src="' + thumbnailSrc 
        +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
        +' on CSE Motors" /></a>'
        grid += '<div class="namePrice">'
        grid += '<hr />'
        grid += '<h2>'
        grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
        grid += '</h2>'
        grid += '<span>$' 
        + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
        grid += '</div>'
        grid += '</li>'
      })
      grid += '</ul>'
    } else { 
      grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
  } catch (error) {
    console.error("Error building classification grid:", error)
    return '<p class="notice">Sorry, there was an error loading the inventory. Please try again later.</p>'
  }
}

/* **************************************
 * Build the vehicle detail view HTML
 * ************************************ */
Util.buildVehicleDetailHTML = async function(vehicle){
  try {
    if (!vehicle) {
      throw new Error("Vehicle data is undefined")
    }
    
    // Get the image filename ONLY
    let imageSrc = vehicle.inv_image
    
    // Extract just the filename (after the last slash)
    const lastSlashIndex = imageSrc.lastIndexOf('/')
    if (lastSlashIndex !== -1) {
      imageSrc = imageSrc.substring(lastSlashIndex + 1)
    }
    
    // Now build the correct path with ONLY ONE "vehicles/"
    imageSrc = '/images/vehicles/' + imageSrc
    
    let html = '<div class="vehicle-detail-container">'
    
    // Vehicle Image Section
    html += '<div class="vehicle-image">'
    html += '<img src="' + imageSrc + '" alt="' 
            + vehicle.inv_make + ' ' + vehicle.inv_model 
            + ' on CSE Motors" />'
    html += '</div>'
    
    // Vehicle Details Section
    html += '<div class="vehicle-details">'
    
    // Make, Model, Year, Price (Prominent Display)
    html += '<div class="prominent-info">'
    html += '<h2>' + vehicle.inv_year + ' ' + vehicle.inv_make + ' ' + vehicle.inv_model + '</h2>'
    html += '<h3 class="price">' + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</h3>'
    html += '</div>'
    
    // Description
    html += '<p class="description">' + vehicle.inv_description + '</p>'
    
    // Details Grid
    html += '<div class="details-grid">'
    
    // Color
    html += '<div class="detail-item">'
    html += '<span class="detail-label">Color:</span>'
    html += '<span class="detail-value">' + vehicle.inv_color + '</span>'
    html += '</div>'
    
    // Mileage
    html += '<div class="detail-item">'
    html += '<span class="detail-label">Mileage:</span>'
    html += '<span class="detail-value">' + new Intl.NumberFormat('en-US').format(vehicle.inv_miles) + ' miles</span>'
    html += '</div>'
    
    // Classification
    html += '<div class="detail-item">'
    html += '<span class="detail-label">Type:</span>'
    html += '<span class="detail-value">' + vehicle.classification_name + '</span>'
    html += '</div>'
    
    // Closing details grid
    html += '</div>'
    
    // Closing vehicle details div
    html += '</div>'
    
    // Closing container div
    html += '</div>'
    
    return html
  } catch (error) {
    console.error("Error building vehicle detail HTML:", error)
    return '<p class="notice">Sorry, there was an error loading the vehicle details. Please try again later.</p>'
  }
}

/* ****************************************
 * Validate classification data
 * ************************************** */
Util.validateClassification = function(classificationName) {
  const errors = []
  
  if (!classificationName || classificationName.trim() === '') {
    errors.push('Classification name is required.')
  } else {
    // Check for spaces
    if (classificationName.includes(' ')) {
      errors.push('Classification name cannot contain spaces.')
    }
    
    // Check for special characters (only letters and numbers allowed)
    const specialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/
    if (specialChars.test(classificationName)) {
      errors.push('Classification name cannot contain special characters.')
    }
    
    // Check length
    if (classificationName.length < 2) {
      errors.push('Classification name must be at least 2 characters long.')
    }
    
    if (classificationName.length > 30) {
      errors.push('Classification name cannot exceed 30 characters.')
    }
  }
  
  return errors
}

/* **************************************
 * Build classification select list
 * ************************************ */
Util.buildClassificationList = async function (classification_id = null) {
  try {
    let data = await invModel.getClassifications()
    let classificationList = '<select name="classification_id" id="classificationList" class="form-input" required>'
    classificationList += "<option value=''>Choose a Classification</option>"
    
    data.rows.forEach((row) => {
      classificationList += '<option value="' + row.classification_id + '"'
      if (classification_id != null && row.classification_id == classification_id) {
        classificationList += " selected "
      }
      classificationList += ">" + row.classification_name + "</option>"
    })
    
    classificationList += "</select>"
    return classificationList
  } catch (error) {
    console.error("Error building classification list:", error)
    return '<select name="classification_id" id="classificationList" class="form-input" required><option value="">Error loading classifications</option></select>'
  }
}

/* ****************************************
 * Validate inventory data
 * ************************************** */
Util.validateInventory = function(invData) {
  const errors = []
  
  // Validate inv_make
  if (!invData.inv_make || invData.inv_make.trim() === '') {
    errors.push('Make is required.')
  } else if (invData.inv_make.length < 2) {
    errors.push('Make must be at least 2 characters long.')
  }
  
  // Validate inv_model
  if (!invData.inv_model || invData.inv_model.trim() === '') {
    errors.push('Model is required.')
  } else if (invData.inv_model.length < 2) {
    errors.push('Model must be at least 2 characters long.')
  }
  
  // Validate inv_year
  if (!invData.inv_year || invData.inv_year.trim() === '') {
    errors.push('Year is required.')
  } else if (!/^\d{4}$/.test(invData.inv_year)) {
    errors.push('Year must be a 4-digit number.')
  } else {
    const year = parseInt(invData.inv_year)
    const currentYear = new Date().getFullYear()
    if (year < 1900 || year > currentYear + 1) {
      errors.push(`Year must be between 1900 and ${currentYear + 1}.`)
    }
  }
  
  // Validate inv_description
  if (!invData.inv_description || invData.inv_description.trim() === '') {
    errors.push('Description is required.')
  } else if (invData.inv_description.length < 10) {
    errors.push('Description must be at least 10 characters long.')
  }
  
  // Validate inv_price
  if (!invData.inv_price || invData.inv_price.trim() === '') {
    errors.push('Price is required.')
  } else if (isNaN(invData.inv_price) || parseFloat(invData.inv_price) <= 0) {
    errors.push('Price must be a positive number.')
  }
  
  // Validate inv_miles
  if (!invData.inv_miles || invData.inv_miles.trim() === '') {
    errors.push('Mileage is required.')
  } else if (isNaN(invData.inv_miles) || parseInt(invData.inv_miles) < 0) {
    errors.push('Mileage must be a non-negative number.')
  }
  
  // Validate inv_color
  if (!invData.inv_color || invData.inv_color.trim() === '') {
    errors.push('Color is required.')
  } else if (invData.inv_color.length < 2) {
    errors.push('Color must be at least 2 characters long.')
  }
  
  // Validate classification_id
  if (!invData.classification_id || invData.classification_id === '') {
    errors.push('Classification is required.')
  }
  
  return errors
}

/* ****************************************
 * Middleware to check token validity
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("notice", "Please log in")
          res.clearCookie("jwt")
          return res.redirect("/account/login")
        }
        res.locals.accountData = accountData
        res.locals.loggedin = 1
        next()
      }
    )
  } else {
    next()
  }
}

/* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util