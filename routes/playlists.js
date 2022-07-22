const express = require("express");
const pug = require("pug");
const axios = require("axios");
// Include querystring to allow for easy parameter creation
const qs = require("querystring");

// Intitialize Express Router
const Router = express.Router();

// Urls
const API_URL = "https://youtube.googleapis.com/youtube/v3/playlists";

// Playlist data returned from requests to YouTube and Spotify APIs
var youtubePlaylistData, spotifyPlaylistData;

// Pass in array of middlewares to handle requests to YouTube and Spotify APIs
Router.get("/", [retrieveYouTubePlaylists, retrieveSpotifyPlaylists], (req,res) => {
	// let playlistsData = await retrievePlaylists();
	const compiledPug = pug.compileFile("./views/playlists.pug");

	res.send(compiledPug({ youtubePlaylistData: youtubePlaylistData.data.items }));
});

async function retrieveYouTubePlaylists(req,res,next) {
	let params = {
		part: "id,snippet,contentDetails,localizations,player,status",
		mine:true,
		key: process.env.API_KEY
	}
	let formattedParams = qs.stringify(params);

	youtubePlaylistData = await axios.get(`${API_URL}?${formattedParams}`,{
		headers: {
			"Authorization": `Bearer ${req.cookies["youtube-access-token"]}`,
			"Accept": "application/json"
		}
	});

	// Go to next middleware
	next();
}
function retrieveSpotifyPlaylists(req,res,next) {
	console.log("Spotify middleware for retrieving playlists");
	// Go to next middleware
	next();
}

module.exports = Router;