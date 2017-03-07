/***
*		Mujahid Maqsood
*		ID: 100939220
*
*		Server 
*		
*		API that serves static pages and as well stores user information about the game that they
*		are playing
*/
var http = require('http');
var fs = require('fs');
var url = require('url');
var mime = require('mime-types');
var querystring = require('querystring');
var makeBoard = require('./lib/make-board.js').makeBoard;
var userList = {};
/***
*		Basic router, every request is captured by this router and is then routed to other
*		routers depending on the URL
*/
function router(req, res) {
	if (req.url !== '/') {
		// URL module helps us focus on specific parts of the url, like the path in this case
		var parsedUrl = url.parse(req.url, true);
		var route = (parsedUrl) ? parsedUrl.pathname : '';
		var isMemoryRoute = route.startsWith('/memory');
		if (isMemoryRoute) {
			// All routes starting with /memory go to our memory router
			memoryRouter(parsedUrl, req, res);
		}
		else {
			// Assume all other requests are requests for files
			fileRouter(parsedUrl, res);
		}
	}
	else {
		// There isn't really a path, so we'll serve the index html to be the default page
		var indexPage = fs.readFileSync('./index.html');
		// Setting code & content type for a good html page
		res.writeHead(200, {'content-type': 'text/html'});
		res.end(indexPage);
	}
};

/***
*		File router, handles serving html/css files from the root directory that exist with the 
*		name specified in the url parameter, if any.
*
*		If the name isn't found, a 404 page is displayed.
*/
function fileRouter(parsedUrl, res) {
	var code;
	var page;
	var filePath = './' + parsedUrl.pathname;
	if (fs.existsSync(filePath)) {
		// We found the page, read it and set the code
		code = 200;
		page = fs.readFileSync(filePath);
	}
	else {
		// We didn't find the requested page, so read the 404 page and set the code to 404
		// indicating that for the user
		code = 404;
		page = fs.readFileSync('./404.html');
	}
	// Setting content type & code appropriately and ending the request
	res.writeHead(code, {'content-type': mime.lookup(filePath) || 'text/html' });
	res.end(page);
}
/***
*		Memory game router, handles registering a user for a new game & sending over 
*		information about a specific card in the game
*/
function memoryRouter(parsedUrl, req, res) {
	var data = '';
	var route = parsedUrl.pathname;
	var query = parsedUrl.query;
	if (req.method === 'POST' && route === '/memory/intro') {
		// Request to register a user with a new game
		readRequestBody(req, function(err, data){
			userList[data.id] = makeBoard(4);
			// Setting content type to plain text
			res.writeHead(200, {'content-type': 'text/plain'});
			res.end();
		});
	} 
	else if (req.method === 'GET' && route === '/memory/card') {
		// Request to get information about a specific card
		if (query.id && query.rowIdx && query.cardIdx) {
			// Three parameters need to be sent in the query
			// We'll look into our internal game board for this user at the requested
			// row and column (card) index and send that card value to them
			data = userList[query.id][query.rowIdx][query.cardIdx];
		}
		// Setting content type to plain text
		res.writeHead(200, {'content-type': 'text/plain'});
		// Sending response
		res.end('' + data);
	}
	else {
		// Setting content type to plain text
		res.writeHead(200, {'content-type': 'text/plain'});
		// Sending response
		res.end(data);
	}
}
/**
 *	Parses a POST request for its data and returns the JSON object
 */
function readRequestBody(req, done) {
	var body = '';
	// Data comes in as a stream, so we'll read it in chunks
	req.on('data', function (chunk) {
		body += chunk;
	});
	req.on('end', function () {
		done(null, querystring.parse(body));
	})
};
// Start the server
var server = http.createServer(router);
server.listen(2406);
