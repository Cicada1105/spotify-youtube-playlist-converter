const express = require("express");
const axios = require("axios");
const Router = express.Router();

const qs = require("querystring");

const PLAYLIST_API_URL = "https://youtube.googleapis.com/youtube/v3/playlists";
const PLAYLIST_ITEMS_API_URL = "https://www.googleapis.com/youtube/v3/playlistItems";
const SEARCH_API_URL = "https://www.googleapis.com/youtube/v3/search";

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
		videoTitles: [ "Video Title 1", "Video Title 2", ... ]
	}
*/
Router.post("/create-playlist",[createPlaylist,buildYouTubePlayList,addToPlaylist],(req,res) => {
	res.redirect("/my-playlists");
});
Router.get("/convert-playlist/:playlistID",[getVideosByPlaystId],(req,res) => {
	res.redirect("/my-playlists");
});

async function createPlaylist(req,res,next) {
	let playlist = req.body;

	let params = {
		part: "snippet"
	}
	let formattedParams = qs.stringify(params);

	let response = await axios.post(`${PLAYLIST_API_URL}?${formattedParams}`,{
		snippet: {
			title: playlist["title"],
			description: playlist["description"]
		}
	},{
		headers: {
			"Authorization": `Bearer ${req.cookies["youtube-access-token"]}`
		}
	});
	let newlyCreatePlaylist = response.data;

	// Playlist title and description are no longer needed so can be removed
	req.body["title"] = undefined;
	req.body["description"] = undefined;
	// Update request body to hold the newly created playlist id
	req.body.playlistId = newlyCreatePlaylist["id"];

	// Proceed to next middleware
	next();
}

// Middleware function that takes body array of song titles, searches youtube, 
//	and creates an array of youtube videos matching respective song titles
async function buildYouTubePlayList(req,res,next) {
	let songTitles = req.body.songTitles;

	let params = {
		part: "snippet",
		q:"",
		type:"video",
		maxResults:1
	}
	let formattedParams = "";

	let newPlaylist = [];

	for (let songTitle of songTitles) {
		// Update query parameter to the current song title
		params["q"] = songTitle;

		formattedParams = qs.stringify(params);

		let result = await axios(`${SEARCH_API_URL}?${formattedParams}`,{
			headers: {
				"Authorization": `Bearer ${req.cookies["youtube-access-token"]}`
			}
		});
		// Retrieve the first found youtube video
		let video = result.data.items[0];
		// Create a video object containing the videoId of the search result
		let videoObj = {
			id: video.id["videoId"]
		}
		// Push the newly created video object into the playlist
		newPlaylist.push(videoObj);
	}

	// Remove song title from the body
	req.body.songTitles = undefined;
	// Add the new playlist to the body data
	req.body.videos = newPlaylist;
	
	// Go to next function
	next();
}

async function addToPlaylist(req,res,next) {
	let playlistId = req.body.playlistId;
	let videos = req.body.videos;

	let params = {
		part: "snippet"
	};
	let formattedParams = qs.stringify(params);

	for (let video of videos) {
		await axios.post(`${PLAYLIST_API_URL}?${formattedParams}`, {
			snippet: {
				playlistId,
				resourceId: {
					kind: "youtube#video",
					videoId: video.id
				}
			}
		}, {
			headers: {
				"Authorization": `Bearer ${req.cookies["youtube-access-token"]}`
			}
		});
	}

	// Go to next function
	next();
}

async function getVideosByPlaystId(req,res,next) {
	let playlistId = req.params["playlistID"];

	let params = {
		part: "snippet",
		playlistId,
		maxResults:50
	};
	let formattedParams = qs.stringify(params);

	let videoTitles = [];

	let response = await axios(`${PLAYLIST_ITEMS_API_URL}?${formattedParams}`,{
		headers: {
			"Authorization": `Bearer ${req.cookies["youtube-access-token"]}`
		}
	});

	// Loop through the returned youtube playlist items, adding the titls to the videoTitles array
	let playlistItems = response.data.items;
	playlistItems.forEach(video => {
		videoTitles.push(video.snippet["title"]);
	});

	// Add view titles array to the body of the request
	req.body.vidoeTitles = videoTitles;

	// Continue on to next function
	next();
}

module.exports = Router;