const express = require("express");
const axios = require("axios");
// Include querystring to allow for easy parameter creation
const qs = require("querystring");

// Urls
const REDIRECT_URI = "http://localhost:8080/spotify/authorize";

// Initialize Express Router
const Router = express.Router();

Router.get("/login", (req,res) => {
	res.redirect("/my-playlists");
});
Router.get("/authorize", (req,res) => {
	res.end();
});

module.exports = Router;