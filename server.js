#!/usr/bin/env node

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

//vars
var flow = require('./flowdockConfig');
var fs = require('fs');
var target = '/flows/' + flow.organization + '/' + flow.flow + '/users';
console.log(target);
var count = 0;
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

	requestGet : function( flowName ){

		console.log('Request sent');

		https.get(
			FlowDock.url,
			function( resp ){
				resp.setEncoding('utf8');
				resp.on( 'data', function(res){
					FlowDock.parseResponse(flowName, res);
				});
			}
		).on('error',function(res){
			console.log('Got error ' + res.message );
		});

	},

	getFlows : function(){

		var exec = require('child_process').exec;

		exec('wc -l flowdock.log | cut -f1 -d\' \'', function (error, results) {
		    lineNum = results.trim();
		    if( lineNum>1000 ){
		    	console.log('Backing up flowdock.log file');
		    	exec('mv flowdock.log flowdock.log.bak');
		    }
		});

		console.log('Requesting flows');

		https.get(
			endpoint + '/flows',
			function( resp ){
				resp.setEncoding('utf8');
				resp.on( 'data', function(res){
					FlowDock.flows, j = JSON.parse(res);

					for(var x=0; x<j.length; x++){
						var flowName = j[x].parameterized_name;
						target = '/flows/' + flow.organization + '/' + flowName + '/users';
						FlowDock.url = endpoint + target;
						console.log( 'target =========>' + target );
						FlowDock.requestGet( flowName );
					}
				});
			}
		);
	},

	/**
	 * Parses a request to FlowDock api.
	 * Callback function for https.get
	 * @param  {http.ServerResponse} resp The server response
	 * @return {void}
	 */
	parseResponse :  function (flowName, chunk) {
		console.log('Parsing response...');
		count++;
		console.log( count + ' events sent since start');

		var j = JSON.parse(chunk);
		var res = [];
		for(var x=0; x<j.length; x++){
			res = {
				id : j[x].id,
				flow : flowName,
				organization : flow.organization,
				nick : j[x].nick,
				last_activity : new Date(j[x].last_activity)
			};
			FlowDock.log( res );
		}
		//FlowDock.serverResponse.end( JSON.stringify(res) );
	},

	/**
	 * Log data to a file
	 * @param  {[type]} data [description]
	 * @return {[type]}      [description]
	 */
	log : function( data ){
		var log = fs.createWriteStream('flowdock.log', {'flags': 'a'});
		log.write( JSON.stringify( data ) + '\n' );		
	}
};

//call FlowDock.requestGet every 5 minutes
FlowDock.getFlows();
setInterval(function(){ FlowDock.getFlows(); }, 1000);

//server
//http.createServer(FlowDock.serverStart).listen(1337, '127.0.0.1');
//console.log('Server is listening on http://127.0.0.1:1337/');
