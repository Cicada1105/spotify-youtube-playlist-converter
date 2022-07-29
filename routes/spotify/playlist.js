const express = require("express");
const Router = express.Router();

Router.get("/",(req,res) => {
	console.log("View Spotify Playlists");
	res.end();
});

module.exports = Router;