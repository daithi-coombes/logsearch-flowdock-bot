var assert = require('assert'),
	exec = require('child_process').exec,
	fs = require('fs');

suite('flowdock-bot', function(){
	var _flowdock;
	var _logEvent;

	setup(function(){

		var dir = process.cwd();

		_flowdock = require( dir + '/lib/flowdock-bot');
		_flowdock.error = errorTest;

		if(!fs.existsSync(dir+'/config/flowdockConfig.js'))
			_flowdock.config = {
				organization: process.env.FLOW_ORG,
				flowName: process.env.FLOW_NAME,
				token: process.env.FLOW_TOKEN
			};
		else
			_flowdock.config = require( dir + '/config/flowdockConfig');
		_flowdock.filename = dir + '/tests/flowdockTest.log';
		_flowdock.logMaxSize = 1000;
		_flowdock.url = 'https://' + _flowdock.config.token + '@api.flowdock.com';
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
		}catch(e){;}
		try{
			if(fs.lstatSync(_flowdock.filename+'.bak'))
				fs.unlinkSync(_flowdock.filename+'.bak')
		}catch(e){;}

		_flowdock = undefined;
	});

	test('get user data from a flow: FlowDock.getFlows()', function(done){

		_flowdock.getFlows(function(flows){
			var expected = Array('id','nick','name','email','avatar','status','disabled','last_activity','last_ping','website','in_flow');
			var flowName = flows[0].parameterized_name;

			_flowdock.getFlow(flowName, '/users', function(flowName, data){
				j = JSON.parse(data);
				var actual = Array();
				for(var key in j[0])
					actual.push(key);

				assert.deepEqual(actual,expected);
				done();
			});
		});
	});

	test('get all flows for organization: FlowDock.getFlows()', function(done){

		var expected = _flowdock.config.organization;
		_flowdock.getFlows(function(flows){
			var ok=true;
			for(var x=0; x<flows.length; x++){
				if(flows[x].organization.parameterized_name!=expected)
					ok=false;
			}

			if(ok)
				done();
		});
	});

	test('parse user data for flow: FlowDock.parseResponse', function(done){
	
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

	test('Test log file is being written to: FlowDock.log()', function(){

		fs.readFile(_flowdock.filename, 'utf8', function(err, data){
			if (err) {
				console.log('Error: ' + err);
				return;
			}
			data = JSON.parse(data.trim());
			assert.deepEqual(data, _logEvent);
		});
	});

	test('Count log file length: FlowDock.logLineCount()', function(done){

		var expected = 1;

		_flowdock.logLineCount(function(actual){
			assert.equal(actual, expected);
			done();
		});
	});

	test('Log file backup: FlowDock.logLineCount()', function(done){
		_flowdock.log( _logEvent );

		_flowdock.logMaxSize = 1;
		var filename = _flowdock.filename;

		_flowdock.logLineCount(function(){
			try {
			    fs.lstat(filename+'.bak', function(){
			        done();
			    });
			}
			catch (e) {
				errorTest(e);
			}
		});
	});
});

function errorTest(e, data){
	throw new Error(data);
}