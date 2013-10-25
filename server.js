var https = require('https');
var flow = require('./flowdockToken');

var target = '/users';
var endpoint = 'https://' + flow.token + '@api.flowdock.com';

function flowdock_get_users(){
	https.get(
		endpoint + target,
		function(res){
			console.log("Status code: " + res.statusCode);
			res.setEncoding('utf8');
			res.on('data', function (chunk) {
				console.log('BODY: ===============>');
				j = JSON.parse(chunk);
				console.log(j[0]);
			});
		}
	).on('error',function(res){
		console.log('Got error ' + res.message );
	});
}
flowdock_get_users();
setInterval(flowdock_get_users, 5000);

/**
 * @deprecated http server, if needed
 *
//server
var http = require('http');
http.createServer(function(req, res){
	res.writeHead('200',{'Content-Type': 'text/plain'});
	res.end('Check console for results');
	setInterval(flowdock_get_users, 5000);
}).listen(1337, '127.0.0.1');
console.log('Server is listening on http://127.0.0.1:1337/');
*/