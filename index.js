const express = require("express");
const path = require("path");
const pug = require("pug");

// Create express application
const app = express();

// Define server settings
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "127.0.0.1";

// Set location of views directory
app.set("views",path.join(__dirname,"views"));
// Set up view engine to be pug
app.set("view engine","pug");

app.get("/",(req,res) => {
	const compiledPug = pug.compileFile("./views/index.pug");

	res.send(compiledPug());
})

app.listen(PORT,HOST,() => {
	console.log(`Listening at: http://${HOST}:${PORT}`);
});