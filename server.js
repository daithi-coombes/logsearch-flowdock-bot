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
	var flowConfig = require('./flowdockConfig');
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
var winston = require('winston');
var fs = require('fs');
var http = require('http');
var https = require('https');

//vars
var filename = 'flowdock.log'; //nb if you change this, please change in `config.json` file as well.
var target = '/flows/' + flow.organization + '/' + flow.flow + '/users';
var timer = 1000 * 60 * 1;	//Request data every 1 minute
var count = 0;
var count_error = 0;
var error_msg = '';
var endpoint = 'https://' + flow.token + '@api.flowdock.com';


/**
 * Logging with winston
 * @see  https://github.com/flatiron/winston#usage
 */
var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({ level: 'error' }),
      new (winston.transports.File)({ filename: filename })
    ]
  });
//end Logging with winston

/**
 * Flowdock Object 
 * @type {FlowDock}
 * @constructor
 */
var FlowDock = {

	/**
	 * The full url that is targeted.
	 * Make sure this is set before FlowDock.requestGet() is called
	 * @type {string}
	 */
	url : endpoint + target,

	/**
	 * The log file line count.
	 * @see  FlowDock.logLineCount()
	 * @type {integer}
	 */
	logCount : 0,

	/**
	 * Maximum size of log file in line numbers
	 * @type {Number}
	 */
	logMaxSize : 5000,

	error : function(e, data){
		console.log('**** error ****');
		console.log(e);
		console.log(body);
		console.log('**** ****');
	},

	/**
	 * Make a get request to flowdock api
	 * @param  {string} flowName The parametarized flow name
	 * @return {void}          
	 */
	requestGet : function( flowName ){

		https.get(
			FlowDock.url,
			function( resp ){
				var body = '';
				resp.setEncoding('utf8');
				resp.on( 'data', function(chunk){
					body += chunk;
				});
				resp.on( 'end', function(){
					FlowDock.parseResponse(flowName, body);
				});
			}
		).on('error',function(res){
			FlowDock.error(res, res.message);
		});

	},//end requestGet()

	/**
	 * Get a list of flows for an organization
	 * @see  ./flowdockConfig.js for defining the organization
	 * @return {void}
	 */
	getFlows : function(){

		https.get(
			endpoint + '/flows',
			function( resp ){
				var body = '';
				resp.setEncoding('utf8');

				resp.on( 'data', function(chunk){
					body += chunk;
				});

				resp.on( 'end', function(){
					try{
						var j = JSON.parse(body);
					} catch (e) {
						FlowDock.error(e, body);
						return;
					}

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
	},//end getFlows()

	/**
	 * Parses a request to FlowDock api.
	 * Callback function for https.get
	 * @param  {http.ServerResponse} resp The server response
	 * @return {void}
	 */
	parseResponse :  function (flowName, chunk) {
		count++;
		FlowDock.logLineCount();

		try{
			var j = JSON.parse(chunk);
		} catch (e) {
			FlowDock.error(e, chunk);
			return;
		}

		console.log(count+' events');

		var res = [];
		for(var x=0; x<j.length; x++){
			res = {
				id : j[x].id,
				flow : flowName,
				organization : flow.organization,
				nick : j[x].nick,
				last_activity : new Date(j[x].last_activity)
			};
			winston = false;
			FlowDock.log( res, winston );
		}
	},//end parseResponse()

	/**
	 * Log data to a file
	 * @param  {json} data The data to be logged
	 * @param {boolean} winston If set to true, then winston logger will be
	 * used. Default false, use `fs` module will be used
	 * @return {void}
	 */
	log : function( data, winston ){

		var data = JSON.stringify(data).trim()+'\n';

		if( winston )
			logger.info( JSON.stringify( data ) );

		else{
			fs.appendFile(
				filename,
				data,
				function(err){
					if(err) throw err;
				});
		}
	},//end log()

	/**
	 * Checks logfile for max size
	 * Max size is defined in line number
	 * @see  FlowDock.logMaxSize
	 * @return {void}
	 */
	logLineCount: function(){
		exec('wc '+filename+' | awk {\'print $1\'}', function (error, results) {
		    if( parseInt(results.trim()) > FlowDock.logMaxSize ){
		    	exec('mv '+filename+' '+filename+'.bak');
		    	exec('rm -rf '+filename);
		    	console.log('Backed up '+filename+' to '+filename+'.bak');
		    }
		});
	}

};//end FlowDock Object


//main()
FlowDock.getFlows();
setInterval(function(){ FlowDock.getFlows(); }, 1000); //timer);
