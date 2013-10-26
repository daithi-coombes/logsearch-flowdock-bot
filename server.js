/**
 * Nodejs server for FlowDock API
 *
 * Create a file `flowdockToken` and place one line init with your flowdock
 * token. Like so:
 * <code>
 * exports.token = '97182bbaa8b2f29dff102b729af468b8';
 * </code>
 *
 * Set the target variable below, `flow`, like so:
 * <code>
 * var target = '/users';
 * <code>
 *
 * from command line run:
 * <code>
 * node server.js
 * </code>
 *
 * @author Daithi Coombes
 */

//set the api target
var target = '/users';

var flow = require('./flowdockToken');
var https = require('https');
var endpoint = 'https://' + flow.token + '@api.flowdock.com';


/**
 * Flowdock Object 
 * @type {FlowDock}
 */
var FlowDock = {

	serverResponse : {},
	url : endpoint + target,

	/**
	 * Parses requests to a http server.
	 * requestListener function/param for http.createServer
	 * @param  {http.ServerRequest} req The request object
	 * @param  {http.ServerResponse} res The response object
	 * @return {void}
	 */
	serverStart : function(req, res){
		res.writeHead('200',{'Content-Type': 'text/json'});
		flowdock.serverResponse = res;
		console.log('Server started: ' + flowdock.url);
		https.get(
			endpoint + target,
			flowdock.parseResponse
		).on('error',function(res){
			console.log('Got error ' + res.message );
		});
	},

	/**
	 * Parses a request to flowdock api.
	 * Callback function for https.get
	 * @param  {http.ServerResponse} resp The server response
	 * @return {void}
	 */
	parseResponse : function( resp ){
		console.log('Parsing response...');
		resp.setEncoding('utf8');
		resp.on('data', function (chunk) {
			flowdock.serverResponse.end(chunk);
		});
	}
};

//server
var http = require('http');
http.createServer(flowdock.serverStart).listen(1337, '127.0.0.1');
console.log('Server is listening on http://127.0.0.1:1337/');
