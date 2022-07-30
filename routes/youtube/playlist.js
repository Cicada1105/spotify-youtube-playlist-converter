const express = require("express");
const axios = require("axios");
const Router = express.Router();

const qs = require("querystring");

const PLAYLIST_API_URL = "https://youtube.googleapis.com/youtube/v3/playlists";
const VIDEO_API_URL = "https://www.googleapis.com/youtube/v3/playlistItems";

Router.get("/",(req,res) => {
	console.log("View YouTube Playlists");
	res.end();
});
/*
	{
		title:"",
		description:"",
		videos: [
			{
				videoId
			}
		]
	}
*/
Router.post("/create-playlist",[createPlaylist,addToPlaylist],(req,res) => {
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

	// Update request body to hold the newly created playlist id
	req.body.playlistId = newlyCreatePlaylist["id"];

	// Proceed to next middleware
	next();
}
async function addToPlaylist(req,res,next) {
	let playlistId = req.body.playlistId;
	let videos = req.body.videos;

	let params = {
		part: "snippet"
	};
	let formattedParams = qs.stringify(params);

	// params = {
	// 	part: "snippet",
	// 	q:"Not Afraid",
	// 	type:"video"
	// }
	// formattedParams = qs.stringify(params);
	// let result = await axios(`https://www.googleapis.com/youtube/v3/search?${formattedParams}`,{
	// 	headers: {
	// 		"Authorization": `Bearer ${req.cookies["youtube-access-token"]}`
	// 	}
	// });

	for (let video of videos) {
		await axios.post(`${VIDEO_API_URL}?${formattedParams}`, {
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

module.exports = Router;