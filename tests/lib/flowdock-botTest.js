var assert = require('assert'),
	async = require('async'),
	exec = require('child_process').exec,
	fs = require('fs');

suite('flowdock-bot', function(){
	var _flowdock;
	var _logEvent;

	setup(function(){
		_flowdock = require('../../lib/flowdock-bot');
		_flowdock.config = require('../../config/flowdockConfig');
		_flowdock.filename = process.cwd() + '/tests/flowdockTest.log';
		_flowdock.logMaxSize = 1000;
		_logEvent = [
			{"id":12345,"flow":"my-flow-1","organization":"coolKats","nick":"coombesy","last_activity":"2013-05-08T16:07:23.180Z"},
			{"id":67890,"flow":"the-other-flow","organization":"coolKids","nick":"daithi","last_activity":"1970-01-01T00:00:00.000Z"}
		];
	});
	teardown(function(){

		try{ //delete test logfile
			if(fs.lstatSync(_flowdock.filename))
				exec('rm -f '+_flowdock.filename);
		}catch(e){}

		_flowdock = undefined;
	});

	test('flowdock-bot.error()', function(){
	});

	test('flowdock-bot.requestGet()', function(){

	});

	test('flowdock-bot.getFlows()', function(){

	});

	test('flowdock-bot.parseResponse()', function(){

	});

	test('flowdock-bot.log()', function(){
		_flowdock.log( _logEvent );

		fs.readFile(_flowdock.filename, 'utf8', function(err, data){
			if (err) {
				console.log('Error: ' + err);
				return;
			}
			data = JSON.parse(data.trim());
			assert.deepEqual(data, _logEvent);
		});
	});

	test('flowdock-bot.logLineCount()', function(){
		_flowdock.log( _logEvent );

		async.series(
			function(callback){	//test line count

				_flowdock.logLineCount(function(res){
					assert.equal(2, _logEvent.length);
					callback(null, "one");
					console.log('*** finished log count ***');
				});
			},
			function(callback){	//re-populate logs

				_flowdock.logMaxSize = 1;
				_flowdock.log.bind(callback);
				_flowdock.log( _logEvent, function(){
					callback(null, "two");
					console.log("****");
				} );
			},
			function(callback){
				_flowdock.logLineCount(function(err, res){
					console.log(err);
					callback(null, "three");
					console.log('*** finished backup ***');
				});
			}
		);

	});
});