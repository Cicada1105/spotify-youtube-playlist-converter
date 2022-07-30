const express = require("express");
const Router = express.Router();
const { getSongsByPlaylistId } = require("./middleware.js");
const { createPlaylist,buildYouTubePlayList,addToPlaylist } = require("../youtube/middleware.js");

Router.get("/",(req,res) => {
	console.log("View Spotify Playlists");
	res.end();
});

/*
	body structure of new playlist to make.
	All values will be retrieved from youtube playlist
	{
		title:"Playlist Title",
		description:"Playlist Description",
		songTitles: [ "Video Title 1", "Video Title 2", ... ]
	}
*/
/*
	Process of middleware functions:
	1. Retrieve spotify videos based on the passed in playlistID
	2. Create new youtube playlist based on retrieved playlist
	3. Search youtube for spotify titles obtained from step 1
	4. Add songs retrieved from youtube to newly created playlist
	5. Return to viewing playlists
*/
Router.post("/convert-playlist/:playlistId",[getSongsByPlaylistId,createPlaylist,buildYouTubePlayList,addToPlaylist],(req,res) => {
	// After creating body structure of song titles and playlist title and description, 
	//	reidrect to youtube routes to create playlist 
	res.redirect("/my-playlists");
});

module.exports = Router;