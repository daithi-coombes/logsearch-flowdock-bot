var assert = require('assert'),
	events = require('events'),
	rewire = require('rewire'),
	util = require('util');


describe('Flowdock Bot:', function(){

	//static
	var expected = [
		{"name":"Foo","parameterized_name":"foo","email":"foo@foobar.flowdock.com","id":"foobar:foo","api_token":"xxxxxxxxxxxxxxxxxxxx","open":true,"joined":true,"access_mode":"invitation","url":"https://api.flowdock.com/flows/foobar/foo","web_url":"https://www.flowdock.com/app/foobar/foo","unread_mentions":0,"organization":{"id":11111,"name":"Foo Bar","parameterized_name":"foobar","user_limit":35,"user_count":22,"active":true,"url":"https://api.flowdock.com/organizations/foobar"}},
		{"name":"Bar","parameterized_name":"bar","email":"bar@foobar.flowdock.com","id":"foobar:bar","api_token":"xxxxxxxxxxxxxxxxxxxx","open":true,"joined":true,"access_mode":"organization","url":"https://api.flowdock.com/flows/foobar/bar","web_url":"https://www.flowdock.com/app/foobar/bar","unread_mentions":0,"organization":{"id":11275,"name":"City Index Labs","parameterized_name":"foobar","user_limit":35,"user_count":22,"active":true,"url":"https://api.flowdock.com/organizations/foobar"}}
	];
	var expectedUsers = [
		{ id: 22222,nick: 'fooness',name: 'Foo Ness',email: 'fooness@example.com',avatar: 'https://avatar.example.com/1',status: null,disabled: false,last_activity: 1368029235680,last_ping: 1368029270825,website: null,in_flow: false },
		{ id: 33333,nick: 'barness',name: 'Bar Ness',email: 'barness@example.com',avatar: 'https://avatar.example.com/2',status: null,disabled: false,last_activity: 1364757756248,last_ping: 1364757758386,website: null,in_flow: false }
	];
	var _config = {
		FLOW_ORG: 'foo',
		FLOW_TOKEN: '1234567890'
	};//end static

	var _flowdock,
		_mocks,
		bot,
		libDir,
		mockResponse;


	beforeEach(function(){

		libDir = process.cwd();
		_flowdock = rewire(libDir+'/lib/flowdockBot');
		bot = _flowdock.getBot();

		mockResponse = require('../../lib/mockResponse').getMock(),
		mockResponse.data = JSON.stringify(expected);
		_mocks = {
			"https" : {
				"get" : function(url, fn){
					fn(mockResponse.data);
					mockResponse.run();
				}
			}
		};

		_flowdock.setConfig(_config);
		_flowdock.__set__(_mocks);
	});
	

	//config tests
	it('Should set and get the config', function(){

		var expected = _config;
		var actual = _flowdock.setConfig(expected)
			.getBot()
			.config;

		assert.deepEqual(expected, actual);
	}); //end ocnfig tests


	/**
	 * Flowdock API tests
	 */
	describe('Flowdock API:', function(){

		it('Should make request for flows', function(done){

			var expected = [
				{"name":"Foo","parameterized_name":"foo","email":"foo@foobar.flowdock.com","id":"foobar:foo","api_token":"xxxxxxxxxxxxxxxxxxxx","open":true,"joined":true,"access_mode":"invitation","url":"https://api.flowdock.com/flows/foobar/foo","web_url":"https://www.flowdock.com/app/foobar/foo","unread_mentions":0,"organization":{"id":11111,"name":"Foo Bar","parameterized_name":"foobar","user_limit":35,"user_count":22,"active":true,"url":"https://api.flowdock.com/organizations/foobar"}},
				{"name":"Bar","parameterized_name":"bar","email":"bar@foobar.flowdock.com","id":"foobar:bar","api_token":"xxxxxxxxxxxxxxxxxxxx","open":true,"joined":true,"access_mode":"organization","url":"https://api.flowdock.com/flows/foobar/bar","web_url":"https://www.flowdock.com/app/foobar/bar","unread_mentions":0,"organization":{"id":11275,"name":"City Index Labs","parameterized_name":"foobar","user_limit":35,"user_count":22,"active":true,"url":"https://api.flowdock.com/organizations/foobar"}}
			];
			mockResponse.data = JSON.stringify(expected);

			bot.getFlows(function(resp){
				var actual = JSON.parse(resp);
				assert.deepEqual(actual, expected);
				done();
			});
		});

		it('Should parse response for flows', function(done){

			bot.parseFlows(mockResponse, function(resp){
				assert.deepEqual(resp, expected);
				done();
			});
			mockResponse.run();
		});

		it('Should make request for a flows users', function(done){

			bot.getFlowUsers('foo',function(resp){
				var actual = JSON.parse(resp);
				assert.deepEqual(actual, expected);
				done();
			});
		});

		it('Should parse response for a flows users', function(done){

			bot.flows.foo = {};
			mockResponse.data = JSON.stringify(expectedUsers);
			mockResponse.req = {
				path: '/flows/'+bot.getConfig.FLOW_ORG+'/foo'
			};

			bot.parseUsers(mockResponse, function(resp){
				assert.deepEqual(resp, expectedUsers);
				done();
			});
			mockResponse.run();
		});
	});// end Flowdock API tests

	
	/**
	 * Logging tests
	 */
	describe('Logs', function(){

		it('Should write to log file', function(done){

			//bot.writeLogs();
			done();
		});

		it('Should create backup');
	});// end Logging tests
});

