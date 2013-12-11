#!/usr/bin/env node

/**
 * Nodejs server for FlowDock API.
 * Gets user activity information for a flow
 *
 * Create a file `flowdockConfig.js` and place one line init with your flowdock
 * token. Like so:
 * <code>
 * exports.flow = 'xxxxxxxxxxxx';
 * exports.organization = 'xxxxxxxxxxxx';
 * exports.token = 'xxxxxxxxxxxx';
 * </code>
 *
 * Next from command line run:
 * <code>
 * node server.js
 * </code>
 *
 * @author Daithi Coombes <webeire@gmail.com>
 */

//load environment variables to this space
if( process.argv[2]=='local' ){
	console.log('Reading config from flowdockConfig.js');
	var flowConfig = require('./config/flowdockConfig');
	var organization = flowConfig.organization;
	var flowName = flowConfig.flow;
	var token = flowConfig.token;
}else{
	console.log('Reading environment variables...')
	var organization = process.env.FLOW_ORG;
	var flowName = process.env.FLOW_NAME;
	var token = process.env.FLOW_TOKEN;
}
var flow = {
	organization : organization,
	flow: flowName,
	token: token
};

//includes
var exec = require('child_process').exec;
var winston = false;	//set to true to use the winston logger @see https://github.com/flatiron/winston#usage
var fs = require('fs');
var http = require('http');
var https = require('https');

//vars
var filename = 'logs/flowdock.log'; //nb if you change this, please change in lumberjack's `config.json` file as well.
var target = '/flows/' + flow.organization + '/' + flow.flow + '/users';
var timer = 1000 * 60 * 1;	//Request data every 1 minute
var count = 0;
var endpoint = 'https://' + flow.token + '@api.flowdock.com';

//create logs dir
if(!fs.existsSync('./logs')){
	fs.mkdirSync('./logs');
}

//setup flowdock module
var flowDock = require('./lib/flowdock-bot');
flowDock.config = flow;
flowDock.url = endpoint;
flowDock.filename = filename;
flowDock.winston = winston;

//main()
function main(){
	flowDock.getFlows(function(flows){

		//get user data for current flow
		for(var x=0; x<flows.length; x++){
			var flowName = flows[x].parameterized_name;
			flowDock.getFlow( flowName, '/users' );
		}
	});	
}
main();
setInterval(function(){main();}, timer);