
describe('Flowdock Bot:', function(){

	var _flowdock,
		assert = require('assert'),
		mocks = require('mocks'),
		rewire = require('rewire'),
		YAML = require('yamljs');
	var _config = {
		FLOW_ORG: 'foo',
		FLOW_TOKEN: '1234567890'
	};

	/**
	 * Mocks literal object for rewire mocking.
	 * @see https://github.com/jhnns/rewire
	 * @type {Object}
	 */
	var _mocks = {
		"https" : {
			"get" : function(url, fn){
				fn(url, fn);
			}
		}
	};

	beforeEach(function(){

		var libDir = process.cwd();
		_flowdock = rewire(libDir+'/lib/flowdockBot');
		_flowdock.setConfig(_config);

		_flowdock.__set__(_mocks);
	});

	it('Should set and get the config', function(){

		var expected = _config;
		var actual = _flowdock.setConfig(expected)
			.getBot()
			.config;

		assert.deepEqual(expected, actual);
	});


	describe('Flowdock API:', function(){

		it('Should make request for flows', function(done){

			var bot = _flowdock.getBot();
			var target = bot.target;

			bot.getFlows(function(resp){
				assert.equal(resp, target+'/flows');
					done();
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
