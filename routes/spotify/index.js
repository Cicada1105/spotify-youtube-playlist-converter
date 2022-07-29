const express = require("express")

// Initialize Express Router
const Router = express.Router();

// Require playlist and authentication handling routes
const PlaylistRouter = require("./playlist.js");
const AuthenticationRouter = require("./auth.js");

Router.use("/",PlaylistRouter);
Router.use("/auth",AuthenticationRouter);

module.exports = Router;