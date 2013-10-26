/**
 * Nodejs server for FlowDock API.
 * Gets user activity information for a flow
 *
 * Create a file `flowdockToken` and place one line init with your flowdock
 * token. Like so:
 * <code>
 * exports.token = 'xxxxxx';
 * </code>
 *
 * Set the variables below
 *
 * from command line run:
 * <code>
 * node server.js
 * </code>
 *
 * @author Daithi Coombes
 */

//set the organization and flow
var organization = 'cityindexlabs';
var flow = 'elasticsearch-poc';

//vars
var target = '/flows/' + organization + '/' + flow + '/users';
var flow = require('./flowdockToken');
var http = require('http');
var https = require('https');
var endpoint = 'https://' + flow.token + '@api.flowdock.com';
var winston = require('winston');

//setup winston logger
var logger = new(winston.Logger)({
	transports : [
		new winston.transports.File({ filename: 'flowdock.log' })
	]
});

/**
 * Flowdock Object 
 * @type {FlowDock}
 * @constructor
 */
var FlowDock = {

	serverResponse : {},
	url : endpoint + target,	//global scope

	/**
	 * Parses requests to a http server.
	 * requestListener function/param for http.createServer
	 * @param  {http.ServerRequest} req The request object
	 * @param  {http.ServerResponse} res The response object
	 * @return {void}
	 */
	serverStart : function(req, res){
		res.writeHead('200',{'Content-Type': 'text/json'});
		FlowDock.serverResponse = res;
		console.log('Server started: ' + FlowDock.url);

		setInterval("FlowDock.requestGet", 5000);

	},

	requestGet : function(){

		console.log('Request sent');

		https.get(
			endpoint + target,
			function( resp ){
				console.log('Parsing response...');
				resp.setEncoding('utf8');
				resp.on( 'data', FlowDock.parseResponse );
			}
		).on('error',function(res){
			console.log('Got error ' + res.message );
		});

	},

	/**
	 * Parses a request to FlowDock api.
	 * Callback function for https.get
	 * @param  {http.ServerResponse} resp The server response
	 * @return {void}
	 */
	parseResponse :  function (chunk) {
		var j = JSON.parse(chunk);
		var res = [];
		for(var x=0; x<j.length; x++)
			res.push({
				id : j[x].id,
				nick : j[x].nick,
				last_activity : new Date(j[x].last_activity)
			});
		logger.warn( JSON.stringify(res) );
		//FlowDock.serverResponse.end( JSON.stringify(res) );
	}
};

//call FlowDock.requestGet every 5 minutes
setInterval(function(){ FlowDock.requestGet(); }, 300000);

//server
//http.createServer(FlowDock.serverStart).listen(1337, '127.0.0.1');
//console.log('Server is listening on http://127.0.0.1:1337/');
