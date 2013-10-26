var flow = require('./flowdockToken');
var https = require('https');

var target = '/users';
var endpoint = 'https://' + flow.token + '@api.flowdock.com';
var data = '';


var flowdock = {

	serverResponse : {},
	url : endpoint + target,

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
