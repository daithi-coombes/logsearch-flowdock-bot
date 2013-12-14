/**
 * FlowDock Module
 * @type {FlowDock}
 * @constructor
 */
var https = require('https');
var exec = require('child_process').exec;

/**
 * The flowdock details. Required:
 *  - (string) organization;
 *  - (string) token;
 * @type {Object}
 */
exports.config = {};
/**
 * Counter for total logs written
 * @type {Number}
 */
exports.count = 0;
/**
 * The full url that is targeted.
 * Make sure this is set before FlowDock.getFlow() is called
 * @type {string}
 */
exports.url = "";
/**
 * The log file line count.
 * @see  FlowDock.logLineCount()
 * @type {integer}
 */
exports.logCount = 0;
/**
 * Maximum size of log file in line numbers
 * @type {Number} Default 5000
 */
exports.logMaxSize = 5000,
/**
 * Whether to use winston logger
 * @type {boolean} Default false
 */
exports.winston;

/**
 * Logging with winston
 * @see  https://github.com/flatiron/winston#usage
 */
if(exports.winston){
	var winston = require('winston');
	var logger = new (winston.Logger)({
	    transports: [
	      new (winston.transports.Console)({ level: 'error' }),
	      new (winston.transports.File)({ filename: filename })
	    ]
	  });
}
//end Logging with winston
var fs = require('fs');

/**
 * Error handler
 * @param  {object} e    The error object
 * @param  {string} data An error message
 */
exports.error = function(e, data){
	console.log('**** error ****');
	console.log(e);
	console.log(data);
	console.log('**** ****');
},


/**
 * Make a get request to flowdock api
 * @param  {string} flowName The parametarized flow name
 * @return {void}          
 */
exports.getFlow = function( flowName, endpoint, fn ){

	var target = exports.url
		+ '/flows/' 
		+ exports.config.organization + '/' 
		+ flowName + '/'
		+ endpoint;
	if(!fn){
		var fn = exports.parseResponse; 
		console.log( 'target =========>' + target );
	}

	https.get(
		target,
		function( resp ){

			var body = '';

			resp.setEncoding('utf8');
			resp.on( 'data', function(chunk){
				body += chunk;
			});
			resp.on( 'end', function(){
				fn(flowName, body);
			});
		}
	).on('error',function(res){
		exports.error(res, res.message);
	});

}//end getFlow()

/**
 * Get a list of flows for an organization
 * @see  ./exportsConfig.js for defining the organization
 * @return {void}
 */
exports.getFlows = function(fn){
	
	//request flows
	https.get(
		exports.url + '/flows',
		function( resp ){

			var body = '';
			resp.setEncoding('utf8');

			//build response
			resp.on( 'data', function(chunk){
				body += chunk;
			});

			//parse response
			resp.on( 'end', function(){
				try{
					var j = JSON.parse(body);
				} catch (e) {
					exports.error(e, body);
					return;
				}

				fn(j);
			});
		}
	).on('error',function(res){
		exports.error(res, res.message);
	});
},//end getFlows()

/**
 * Parses a request to exports api.
 * Callback function for https.get
 * @param {string} flowName The name of the current flow
 * @param  {http.ServerResponse} chunk The server response
 * @return {void}
 */
exports.parseResponse =  function (flowName, chunk, fn) {
	exports.count++;
	exports.logLineCount();
	if(!fn)
		console.log(exports.count+' events');

	//parse chunk
	try{
		var j = JSON.parse(chunk);
	} catch (e) {
		exports.error(e, chunk);
		return;
	}

	//log each event
	for(var x=0; x<j.length; x++){
		exports.log({
			id : j[x].id,
			flow : flowName,
			organization : exports.config.organization,
			nick : j[x].nick,
			last_activity : new Date(j[x].last_activity)
		});
	}
	if(fn)
		fn();
},//end parseResponse()

/**
 * Log data to a file
 * @param  {json} data The data to be logged
 * @param {boolean} winston If set to true, then winston logger will be
 * used. Default false, use `fs` module will be used
 * @return {void}
 */
exports.log = function( data, fn ){

	var data = JSON.stringify(data).trim()+'\n';

	if( exports.winston )
		logger.info( JSON.stringify( data ) );
	else
		fs.appendFileSync(exports.filename, data);
	
	if(fn) fn();
},//end log()

/**
 * Checks logfile for max size
 * Max size is defined in line number
 * @see  exports.logMaxSize
 * @return {void}
 */
exports.logLineCount =  function(fn){
	var cmd = 'wc "'+exports.filename+'" | awk {\'print $1\'}';
	exec(cmd, function (error, results) {

		if(error)
			throw new Error(error);

		res = parseInt(results.trim());

	    if(  res > exports.logMaxSize ){

	    	exec('mv '+exports.filename+' '+exports.filename+'.bak', fn);
	    	if(!fn)
	    		console.log('Backed up '+exports.filename+' to '+exports.filename+'.bak');
	    }
		else if(fn)
	    	fn(res);
	});
}//end logLineCount
