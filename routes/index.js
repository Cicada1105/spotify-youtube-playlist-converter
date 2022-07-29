const express = require("express");
const Router = express.Router();

// Require External Routers
const YouTubeRouter = require("./youtube/");
const SpotifyRouter = require("./spotify/");
const PlaylistsRouter = require("./playlists.js");

// Define base url for routes
Router.use("/youtube",YouTubeRouter);
Router.use("/spotify",SpotifyRouter);
Router.use("/my-playlists",PlaylistsRouter);

module.exports = Router;