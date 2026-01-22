const invModel = require("../models/inventory-model")
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
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util