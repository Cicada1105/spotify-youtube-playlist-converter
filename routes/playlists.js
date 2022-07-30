const express = require("express");
const pug = require("pug");
const axios = require("axios");
// Include querystring to allow for easy parameter creation
const qs = require("querystring");

// Intitialize Express Router
const Router = express.Router();

// Urls
const YOUTUBE_API_URL = "https://youtube.googleapis.com/youtube/v3/playlists";
const SPOTIFY_API_URL = "https://api.spotify.com/v1"; 

// Playlist data returned from requests to YouTube and Spotify APIs
var youtubePlaylistData, spotifyPlaylistData;

// Pass in array of middlewares to handle requests to YouTube and Spotify APIs
Router.get("/", [retrieveYouTubePlaylists, retrieveSpotifyPlaylists], (req,res) => {
	const compiledPug = pug.compileFile("./views/playlists.pug");

	res.send(compiledPug({ 
		youtubePlaylistData: youtubePlaylistData.items, 
		spotifyPlaylistData: spotifyPlaylistData.items
	}));
});

async function retrieveYouTubePlaylists(req,res,next) {
	let params = {
		part: "id,snippet,contentDetails,localizations,player,status",
		mine:true,
		key: process.env.API_KEY
	}
	let formattedParams = qs.stringify(params);

	let youtubeResponse = await axios.get(`${YOUTUBE_API_URL}?${formattedParams}`,{
		headers: {
			"Authorization": `Bearer ${req.cookies["youtube-access-token"]}`,
			"Accept": "application/json"
		}
	});
	// Retrieve the playlist data from the response
	youtubePlaylistData = youtubeResponse.data;

	// Go to next middleware
	next();
}
async function retrieveSpotifyPlaylists(req,res,next) {
	let spotifyResponse = await axios.get(`${SPOTIFY_API_URL}/me/playlists`,{
		headers: {
			"Authorization": `Bearer ${req.cookies["spotify-access-token"]}`,
			"Content-Type": "application/json"
		}
	});
	// Retrieve the playlist data from the response
	spotifyPlaylistData = spotifyResponse.data;

	// Go to next middleware
	next();
}

module.exports = Router;