const express = require("express");
const axios = require("axios");
// Include querystring to allow for easy parameter creation
const qs = require("querystring");

// Create express router
const Router = express.Router();

// Urls
const AUTHORIZATION_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const REDIRECT_URI = "http://localhost:8080/youtube/authorize";
const SCOPES = "https://www.googleapis.com/auth/youtube.force-ssl";

// State - random string to prevent any man in the middle attacks
const STATE = "D8E4js82-smc-fdj24DFLIHA";

let accessToken, code;

Router.get("/login",(req,res) => {
	if (accessToken === undefined)
		startAuthorizing(res);
	else // Access token already obtained
		// Redirect to spotify login
		res.redirect("/spotify/login");
});
Router.get("/authorize",(req,res) => {
	if (req.query.code) {
		if (req.query.state === STATE) 
			code = req.query.code;
	}
	if (!accessToken && !code) 
		startAuthorizing(res);
	else
		getAccessToken(res);
});
function startAuthorizing(res) {
	let params = {
		client_id: process.env.CLIENT_ID,
		redirect_uri: REDIRECT_URI,
		response_type: "code",
		scope: SCOPES,
		state: STATE
	}
	let formattedParams = qs.stringify(params);

	res.redirect(`${AUTHORIZATION_ENDPOINT}?${formattedParams}`);
}
function getAccessToken(res) {
	let params = {
		client_id: process.env.CLIENT_ID,
		client_secret: process.env.CLIENT_SECRET,
		code,
		grant_type: "authorization_code",
		redirect_uri: REDIRECT_URI
	}

	let formattedParams = qs.stringify(params);
	const TOKEN_SERVER = "https://oauth2.googleapis.com/token";

	// Make request to receive refresh and access tokens
	axios.post(TOKEN_SERVER,formattedParams,{
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		}
	}).then((response) => {
		// Set access token locally for any possible future access
		accessToken = response.data.access_token;
		// Store in cookie as well to access after redirection
		res.cookie("youtube-access-token",accessToken);
		// Reset code
		code = null;
		// Redirect to spotify login
		res.redirect("/spotify/login");
	}).catch((err) => {
		console.log(err);
		res.end();
	})
}

module.exports = Router;