var _flowdock = require('../../lib/flowdockBot'),
	assert = require('assert'),
	fs = require('fs');


describe('Flowdock Bot:', function(){

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


	describe('/flows API', function(){
		it('Should make request for flows');
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