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
		_flowdock.log( _logEvent );
	});
	teardown(function(){

		try{ //delete test logfile
			if(fs.lstatSync(_flowdock.filename))
				fs.unlinkSync(_flowdock.filename);
		}catch(e){console.log(e)}

		_flowdock = undefined;
	});

	test('flowdock-bot.error()', function(){
	});

	test('flowdock-bot.requestGet()', function(){

	});

	test('flowdock-bot.getFlows()', function(){

	});

	test('flowdock-bot.parseResponse()', function(done){
	
		fs.unlinkSync( _flowdock.filename );

		var expected = [{
					id : 1,
					flow: 'test',
					organization: _flowdock.config.organization,
					nick: 'coombesy',
					last_activity: '2013-05-08T16:07:23.180Z'
				}];
		_flowdock.parseResponse('test', JSON.stringify(expected), function(){});

		fs.readFile(_flowdock.filename, 'utf8', function(err, data){
			if (err) {
				console.log('Error: ' + err);
				return;
			}
			
			actual = JSON.parse(data.trim());
			assert.deepEqual(
				actual,
				expected[0]
			);
			done();
		});
});

	test('flowdock-bot.log()', function(){

		fs.readFile(_flowdock.filename, 'utf8', function(err, data){
			if (err) {
				console.log('Error: ' + err);
				return;
			}
			data = JSON.parse(data.trim());
			assert.deepEqual(data, _logEvent);
		});
	});

	test('Count log file length', function(done){

		var expected = 1;

		_flowdock.logLineCount(function(actual){
			assert.equal(actual, expected);
			done();
		});
	});

	test('Log file backup', function(done){
		_flowdock.log( _logEvent );

		_flowdock.logMaxSize = 1;
		var filename = _flowdock.filename;

		_flowdock.logLineCount(function(){
			try {
			    stats = fs.lstatSync(filename+'.bak');

			    if (stats.isFile())
			        done();
			    else
			    	throw new Error('Backup file not created');
			}
			catch (e) {
				console.log(arguments);
				throw new Error(e);
			}
		});
	});
});