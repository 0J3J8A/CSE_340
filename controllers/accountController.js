// Needed Resources
const utilities = require("../utilities/")
const accountModel = require("../models/account-model")

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    messages: req.flash(),
    errors: null, // AÑADIR
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    messages: req.flash(),
    errors: null, // AÑADIR
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  console.log("Registration data received:", {
    account_firstname,
    account_lastname,
    account_email,
    account_password: "***hidden***"
  })

  try {
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      account_password
    )

    console.log("Database result:", regResult)

    if (regResult && regResult.rows && regResult.rows.length > 0) {
      // SUCCESS
      req.flash("success", `Congratulations, you're registered ${account_firstname}. Please log in.`)
      console.log("Flash message set: success")
      res.redirect("/account/login")
    } else {
      // ERROR
      req.flash("error", "Sorry, the registration failed. Please try again.")
      console.log("Flash message set: error")
      res.redirect("/account/register")
    }
  } catch (error) {
    console.error("Registration error:", error)
    req.flash("error", `Registration error: ${error.message}`)
    res.redirect("/account/register")
  }
}

module.exports = { buildLogin, buildRegister, registerAccount }