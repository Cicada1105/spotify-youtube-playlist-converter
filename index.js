const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const pug = require("pug");

// Define server settings
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || "127.0.0.1";

// Create express application
const app = express();

// Initialize environment config
const dotenv = require("dotenv");
dotenv.config();

// Set location of views directory
app.set("views",path.join(__dirname,"views"));
// Set up view engine to be pug
app.set("view engine","pug");

// Middleware
app.use(cookieParser());

// Home navigation
app.get("/",(req,res) => {
	const compiledPug = pug.compileFile("./views/index.pug");

	res.send(compiledPug());
});

// Require External Routers
const YouTubeRouter = require("./routes/youtube.js");
// Define base url for routes
app.use("/youtube",YouTubeRouter);


app.listen(PORT,HOST,() => {
	console.log(`Listening at: http://${HOST}:${PORT}`);
});