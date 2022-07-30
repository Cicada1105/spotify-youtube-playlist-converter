const axios = require("axios");
const qs = require("querystring");

// API URLs
const USER_PLAYLIST_BASE_URI = "https://api.spotify.com/v1/users";
const SEARCH_API_URL = "https://api.spotify.com/v1/search";
const PLAYLIST_API_URL = "https://api.spotify.com/v1/playlists";

async function createPlaylist(req,res,next) {
	let playlist = req.body;

	let userId = req.cookies["user-id"];

	let response = await axios.post(`${USER_PLAYLIST_BASE_URI}/${userId}/playlists`,{
		name: playlist["title"],
		description: playlist["description"]
	},{
		headers: {
			"Authorization": `Bearer ${req.cookies["spotify-access-token"]}`,
			"Content-Type": "application/json"
		}
	});

	// Remove title and description as they are no longer needed
	req.body["title"] = undefined;
	req.body["description"] = undefined;
	// Retrieve newly added playlist and store id
	let newPlaylist = response.data;
	req.body["playlistId"] = newPlaylist["id"];

	// Continue on to next function
	next();
}

async function buildSpotifyPlaylist(req,res,next) {
	let songTitles = req.body["songTitles"];

	let params = {
		limit: 5,
		type: "track"
	}

	let formattedParams;
	let newPlaylist = [];

	for (let title of songTitles) {
		params['q'] = title;
		formattedParams = qs.stringify(params);

		let result = await axios(`${SEARCH_API_URL}?${formattedParams}`,{
			headers: {
				"Authorization": `Bearer ${req.cookies["spotify-access-token"]}`
			}
		});

		// Retrieve searched tracks
		let tracks = result.data["tracks"];
		// Obtain the first song matching the query
		let song = tracks.items[0];
		// Store unique uri for later adding to newly created playlist
		newPlaylist.push(song["uri"]);
	}

	// Remove video titles from request body
	req.body["songTitles"] = undefined;
	// Store newly created playlist to request body
	req.body.songUris = newPlaylist;

	// Continue on to next function
	next();
}

async function addToPlaylist(req,res,next) {
	// Retrieve id and array of song URIs to add to the playlist specfied by passed in id
	let playlistId = req.body["playlistId"];
	let songUris = req.body["songUris"];

	await axios.post(`${PLAYLIST_API_URL}/${playlistId}/tracks`,{
		uris: songUris
	}, {
		headers: {
			"Authorization": `Bearer ${req.cookies["spotify-access-token"]}`
		}
	});

	// Continue on to next function
	next();	
}

async function getSongsByPlaylistId(req,res,next) {
	let playlistId = req.params["playlistId"];

	let result = await axios.get(`${PLAYLIST_API_URL}/${playlistId}`,{
		headers: {
			"Authorization": `Bearer ${req.cookies["spotify-access-token"]}`,
			"Content-Type": "application/json"
		}
	});

	// Retrieve the playlist
	let playlist = result.data;

	// Retrieve title and description of the playlist
	let playlistTitle = playlist["name"];
	let playlistDescription = playlist["description"];

	// Retrieve the tracks and songs from the playlist
	let tracks = playlist["tracks"];
	let songs = tracks["items"];

	// Loop through songs, adding titles to array
	let songTitles = [];
	songs.forEach(song => songTitles.push(song.track["name"]));

	// Add playlist title and description, and song titles array to body
	req.body = {
		title: playlistTitle,
		description: playlistDescription,
		songTitles
	}

	// Continue on to next function
	next();		
}

module.exports = {
	createPlaylist, buildSpotifyPlaylist,
	addToPlaylist, getSongsByPlaylistId
}