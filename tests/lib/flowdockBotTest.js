var _flowdock = require('../../lib/flowdockBot'),
	assert = require('assert'),
	fs = require('fs'),
	YAML = require('yamljs'),
	config;


describe('Flowdock Bot:', function(){

	beforeEach(function(){
		_flowdock.setConfig(YAML.load('./conf/flowdock.yml').env);
	});

	it('Should set the config', function(){

		var expected = {
			FLOW_ORG: 'foo',
			FLOW_TOKEN: '1234567890'
		};
		var actual = _flowdock.setConfig(expected)
			.getBot()
			.config;

		assert.deepEqual(expected, actual);
	});


	describe('Flowdock API:', function(){

		it('Should make request for flows', function(done){

			var bot = _flowdock.getBot();

			bot.getFlows(function(resp){
				if(resp.statusCode==200)
					done();
				else
					throw new Error(resp.headers.status);
			});
		});

		it('Should parse resposne for flows');
	});


	describe('$flow/users API', function(){
		it('Should make request for a flows users');
		it('Should parse response for a flows users');
	});


	describe('Logs', function(){
		it('Should write to log file');
		it('Should create backup');
	});
});
