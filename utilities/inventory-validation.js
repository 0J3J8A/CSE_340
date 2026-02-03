const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}

/*  **********************************
 *  Inventory Data Validation Rules
 * ********************************* */
validate.inventoryRules = () => {
  return [
    // inv_make is required and must be at least 2 characters
    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Make must be at least 2 characters."),

    // inv_model is required and must be at least 2 characters
    body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Model must be at least 2 characters."),

    // inv_year is required and must be a valid 4-digit year
    body("inv_year")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 4, max: 4 })
      .withMessage("Year must be a 4-digit number.")
      .custom((value) => {
        const year = parseInt(value)
        const currentYear = new Date().getFullYear()
        if (year < 1900 || year > currentYear + 1) {
          throw new Error(`Year must be between 1900 and ${currentYear + 1}.`)
        }
        return true
      }),

    // inv_description is required and must be at least 10 characters
    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 10 })
      .withMessage("Description must be at least 10 characters."),

    // inv_price is required and must be a positive number
    body("inv_price")
      .trim()
      .notEmpty()
      .isFloat({ min: 0.01 })
      .withMessage("Price must be a positive number."),

    // inv_miles is required and must be a non-negative number
    body("inv_miles")
      .trim()
      .notEmpty()
      .isInt({ min: 0 })
      .withMessage("Mileage must be a non-negative number."),

    // inv_color is required and must be at least 2 characters
    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Color must be at least 2 characters."),

    // classification_id is required
    body("classification_id")
      .trim()
      .notEmpty()
      .withMessage("Classification is required."),

    // inv_id is required for updates
    body("inv_id")
      .trim()
      .notEmpty()
      .withMessage("Inventory ID is required."),
  ]
}

/* ******************************
 * Check inventory data and return errors or continue to update
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body

  let errors = []
  errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    
    res.render("./inventory/edit-inventory", {
      errors,
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    })
    return
  }
  next()
}

module.exports = validate