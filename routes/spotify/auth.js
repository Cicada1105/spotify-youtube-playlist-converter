const express = require("express");
const axios = require("axios");
// Include querystring to allow for easy parameter creation
const qs = require("querystring");

// Initialize Express Router
const Router = express.Router();

// Urls
const AUTHORIZATION_ENDPOINT = "https://accounts.spotify.com/authorize";
const TOKEN_SERVER = "https://accounts.spotify.com/api/token";
const REDIRECT_URI = "http://localhost:8080/spotify/auth/authorize";
const USER_PROFILE_URI = "https://api.spotify.com/v1/me";

const SCOPES = "playlist-modify-public"

// State - random string to prevent any man in the middle attacks
const STATE = "cjPekA39=dnjkl3SK-d3fdsa3GA$";

let accessToken, code;

Router.get("/login", (req,res) => {
	if ((accessToken === undefined) && (req.cookies["spotify-access-token"] === undefined))
		startAuthorizing(res);
	else // Access token already obtained
		// Redirect to playlists
		res.redirect("/my-playlists");
});
Router.get("/authorize", (req,res) => {
	if (req.query.code)
		if (req.query.state === STATE)
			code = req.query.code;
	if (!accessToken && !code)
		startAuthorizing(res);
	else
		getAccessToken(req,res);
});

function startAuthorizing(res) {
	let params = {
		client_id: process.env.SPOTIFY_CLIENT_ID,
		response_type: "code",
		redirect_uri: REDIRECT_URI,
		state: STATE,
		scope: SCOPES
	}
	let formattedParams = qs.stringify(params);

	res.redirect(`${AUTHORIZATION_ENDPOINT}?${formattedParams}`);
}
function getAccessToken(req,res) {
	let params = {
		grant_type: 'authorization_code',
		code,
		redirect_uri: REDIRECT_URI
	}
	let formattedParams = qs.stringify(params);

	axios.post(TOKEN_SERVER,formattedParams,{
		headers: {
			"Authorization": "Basic " + (Buffer.from(process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET).toString("base64")),
			"Content-Type": "application/x-www-form-urlencoded"
		}
	}).then((response) => {
		// Set access token locally for any possible future access
		accessToken = response.data.access_token;
		// Store in cookie to be accessed after redirection
		res.cookie("spotify-access-token",accessToken);
		// Reset code
		code = null;
		// Redirect to playlists
		// res.redirect("/my-playlists");
		// Get userId
		getUserId(req,res)
	}).catch((err) => {
		console.log(err);
		res.end();
	})
}

function getUserId(req,res) {
	axios(USER_PROFILE_URI, {
		headers: {
			"Authorization": `Bearer ${accessToken}`,
			"Content-Type": "application/json"
		}
	}).then(response => {
		let user = response.data;
		// Store user id in cookie to be later accessed for retrieving spotify playlist data
		res.cookie("user-id",user["id"]);
		res.redirect("/my-playlists")
	}).catch(err => {
		console.log(err);
		console.log("Error getting Spotify User Id");
		res.end("Error getting Spotify User Id");
	})
}
module.exports = Router;