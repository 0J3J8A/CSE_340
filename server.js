/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()

/* ***********************
 * Middleware
 *************************/
app.use(express.static("public"))  // <-- AÑADE ESTA LÍNEA
app.use(expressLayouts)

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.set("layout", "./layouts/layout")

/* ***********************
 * Routes
 *************************/
// Index Route
app.get("/", function(req, res) {
  res.render("index", { title: "Home" })
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 3000
const host = process.env.HOST || "localhost"

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})