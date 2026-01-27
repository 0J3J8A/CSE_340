const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res, next){
  try {
    const nav = await utilities.getNav()
    res.render("index", {title: "Home", nav})
    /* req.flash("notice", "This is a flash message.") */
  } catch (error) {
    console.error("Error in buildHome:", error)
    next(error)
  }
}

module.exports = baseController