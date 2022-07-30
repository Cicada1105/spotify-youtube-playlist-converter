const express = require("express");
const Router = express.Router();

const { getVideosByPlaylistId } = require("./middleware.js");
const { createPlaylist, buildSpotifyPlaylist, addToPlaylist } = require("../spotify/middleware.js");

Router.get("/",(req,res) => {
	console.log("View YouTube Playlists");
	res.end();
});

/*
	body structure of new playlist to make.
	All values will be retrieved from spotify playlist
	{
		title:"Playlist Title",
		description:"Playlist Description",
		songTitles: [ "Song Title 1", "Song Title 2", ... ]
	}
*/
/*
	Process of middleware functions:
	1. Retrieve youtube videos based on the passed in playlistID
	2. Create new spotify playlist based on retrieved playlist
	3. Search spotify for youtube titles obtained from step 1
	4. Add songs retrieved from spotify to newly created playlist
	5. Return to viewing playlists
*/
Router.get("/convert-playlist/:playlistID",[getVideosByPlaylistId,createPlaylist,buildSpotifyPlaylist,addToPlaylist],(req,res) => {
	// After creating body structure of song titles and playlist title and description, 
	//	reidrect to youtube routes to create playlist 
	res.redirect("/my-playlists");
});


module.exports = Router;