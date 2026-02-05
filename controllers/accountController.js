// Needed Resources
const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    messages: req.flash(),
    errors: null,
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
    errors: null,
    account_firstname: '',
    account_lastname: '',
    account_email: ''
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

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  try {
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
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

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
 *  Deliver account management view
 * ************************************ */
async function buildAccountManagement(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/management", {
    title: "Account Management",
    nav,
    messages: req.flash(),
    errors: null,
  })
}

/* ****************************************
 *  Deliver account update view
 * ************************************ */
async function buildAccountUpdateView(req, res, next) {
  try {
    let nav = await utilities.getNav()
    const account_id = parseInt(req.params.account_id)
    
    // Verify that the logged-in user is updating their own account
    if (res.locals.accountData.account_id !== account_id) {
      req.flash("notice", "You can only update your own account.")
      return res.redirect("/account/")
    }
    
    const accountData = await accountModel.getAccountById(account_id)
    
    if (!accountData) {
      req.flash("notice", "Account not found.")
      return res.redirect("/account/")
    }
    
    res.render("account/update", {
      title: "Update Account",
      nav,
      messages: req.flash(),
      errors: null,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      account_id: accountData.account_id
    })
  } catch (error) {
    console.error("Error in buildAccountUpdateView:", error)
    req.flash("error", "Error loading update page.")
    res.redirect("/account/")
  }
}

/* ****************************************
 *  Process account update
 * ************************************ */
async function updateAccount(req, res, next) {
  try {
    let nav = await utilities.getNav()
    const { account_id, account_firstname, account_lastname, account_email } = req.body
    
    // Verify that the logged-in user is updating their own account
    if (res.locals.accountData.account_id !== parseInt(account_id)) {
      req.flash("notice", "You can only update your own account.")
      return res.redirect("/account/")
    }
    
    const updateResult = await accountModel.updateAccount(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    )
    
    if (updateResult) {
      // Update the JWT token with new data
      const accountData = await accountModel.getAccountById(account_id)
      delete accountData.account_password
      
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      
      req.flash("success", "Account information updated successfully.")
      res.redirect("/account/")
    } else {
      req.flash("error", "Failed to update account information.")
      res.redirect(`/account/update/${account_id}`)
    }
  } catch (error) {
    console.error("Error in updateAccount:", error)
    req.flash("error", "Error updating account information.")
    res.redirect("/account/")
  }
}

/* ****************************************
 *  Process password change
 * ************************************ */
async function updatePassword(req, res, next) {
  try {
    let nav = await utilities.getNav()
    const { account_id, account_password } = req.body
    
    // Verify that the logged-in user is updating their own account
    if (res.locals.accountData.account_id !== parseInt(account_id)) {
      req.flash("notice", "You can only update your own account.")
      return res.redirect("/account/")
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hashSync(account_password, 10)
    
    const updateResult = await accountModel.updatePassword(account_id, hashedPassword)
    
    if (updateResult) {
      req.flash("success", "Password updated successfully.")
      res.redirect("/account/")
    } else {
      req.flash("error", "Failed to update password.")
      res.redirect(`/account/update/${account_id}`)
    }
  } catch (error) {
    console.error("Error in updatePassword:", error)
    req.flash("error", "Error updating password.")
    res.redirect("/account/")
  }
}

/* ****************************************
 *  Process logout
 * ************************************ */
async function logout(req, res, next) {
  try {
    res.clearCookie("jwt")
    req.flash("success", "You have been logged out successfully.")
    res.redirect("/")
  } catch (error) {
    console.error("Error in logout:", error)
    req.flash("error", "Error during logout.")
    res.redirect("/")
  }
}

module.exports = { 
  buildLogin, 
  buildRegister, 
  registerAccount, 
  accountLogin,
  buildAccountManagement,
  buildAccountUpdateView,
  updateAccount,
  updatePassword,
  logout
}