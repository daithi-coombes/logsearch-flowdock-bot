var assert = require('assert'),
	db = require(process.cwd()+'/lib/jsondb'),
	fs = require('fs')
	rewire = require('rewire'),
	util = require('util')


describe('Flowdock Bot:', function(){

	//static
	var expected = [
		{"name":"Foo","parameterized_name":"foo","email":"foo@foobar.flowdock.com","id":"foobar:foo","api_token":"xxxxxxxxxxxxxxxxxxxx","open":true,"joined":true,"access_mode":"invitation","url":"https://api.flowdock.com/flows/foobar/foo","web_url":"https://www.flowdock.com/app/foobar/foo","unread_mentions":0,"organization":{"id":11111,"name":"Foo Bar","parameterized_name":"foobar","user_limit":35,"user_count":22,"active":true,"url":"https://api.flowdock.com/organizations/foobar"},"users":{}},
		{"name":"Bar","parameterized_name":"bar","email":"bar@foobar.flowdock.com","id":"foobar:bar","api_token":"xxxxxxxxxxxxxxxxxxxx","open":true,"joined":true,"access_mode":"organization","url":"https://api.flowdock.com/flows/foobar/bar","web_url":"https://www.flowdock.com/app/foobar/bar","unread_mentions":0,"organization":{"id":11275,"name":"City Index Labs","parameterized_name":"foobar","user_limit":35,"user_count":22,"active":true,"url":"https://api.flowdock.com/organizations/foobar"},"users":{}}
	]
	var expectedUsers = [
		{ id: 22222,nick: 'fooness',name: 'Foo Ness',email: 'fooness@example.com',avatar: 'https://avatar.example.com/1',status: null,disabled: false,last_activity: 1368029235680,last_ping: 1368029270825,website: null,in_flow: false },
		{ id: 33333,nick: 'barness',name: 'Bar Ness',email: 'barness@example.com',avatar: 'https://avatar.example.com/2',status: null,disabled: false,last_activity: 1364757756248,last_ping: 1364757758386,website: null,in_flow: false }
	]
	var _config = {
		FLOW_ORG: 'foo',
		FLOW_TOKEN: '1234567890'
	}//end static

	//unique unit test globals
	var flowdock,
		mocks,
		bot,
		libDir,
		mockResponse
	// end unique unit test globals

	beforeEach(function(done){

		//setup globals
		libDir = process.cwd()
		flowdock = rewire( libDir + '/lib/flowdockBot' )
		_model = rewire( libDir + '/lib/jsondb' )
		bot = flowdock.getBot()

		//global mock object
		mockResponse = require('../../lib/mockResponse').getMock(),
		mockResponse.data = JSON.stringify(expected)

		//rewire mocks object
		mocks = {
			"https" : {
				"get" : function(url, fn){
					
					//get data from global mockResponse
					var mock = require('../../lib/mockResponse').getMock()
					mock.data = mockResponse.data

					//return unique mock response
					fn(mock)
					mock.run()
				},
				"setEncoding" : function(type){
					
				}
			}
		}

		//rewire modules
		flowdock.setConfig(_config)
		flowdock.getBot().filename = process.cwd()+'/tests/logs/flowdock.log'
		flowdock.__set__(mocks)
		
		
		flowdock.getBot().setupDB(function(){

			done()
		})
	})
	
	afterEach(function(done){

		fs.unlink(flowdock.getBot().filename, function(err){
			if(flowdock.getDB().getDB().database){
				fs.unlinkSync(flowdock.getDB().getDB().database)
				done()
			}
			else{
				done()
			}
		})
	})

	//config tests
	it('Should set and get the config', function(done){

		var expected = _config
		var actual = flowdock.setConfig(expected)
			.getBot()
			.config

		assert.deepEqual(expected, actual)
		done()
	}) //end ocnfig tests


	/**
	 * Flowdock API tests
	 */
	describe('Flowdock API:', function(){
		
		it('Should make request for flows', function(done){

			mockResponse.data = expected

			bot.getFlows(function(resp){
				var _data = ''
				resp.on('data', function(resp){
					_data += JSON.stringify(resp)
				})
				resp.on('end', function(){

					var actual = JSON.parse(_data)

					assert.deepEqual(actual, expected)
					done()
				})
			})
		})
		
		it('Should parse response for flows', function(done){

			bot.parseFlows(mockResponse, function(resp){
				assert.deepEqual(resp, expected)
				done()
			})
			mockResponse.run()
		})

		it('Should make request for a flows users', function(done){

			bot.getFlowUsers('foo',function(resp){
				resp.on('data', function(j){
					var actual = JSON.parse(j)
					assert.deepEqual(actual, expected)
					done()
				})
			})
		})

		it('Should parse response for a flows users', function(done){

			bot.flows.foo = {}
			var mockResponse = require('../../lib/mockResponse').getMock()
			mockResponse.data = JSON.stringify(expectedUsers)
			mockResponse.req = {
				path: '/flows/'+bot.getConfig.FLOW_ORG+'/foo'
			}

			bot.parseUsers(mockResponse, function(resp){
				assert.deepEqual(resp, expectedUsers)
				done()
			})
			mockResponse.run()
		})
	})// end Flowdock API tests

	/**
	 * Flowdock Model tests
	 */
	describe('Database', function(){
		
		it('Should setup database', function(done){
			this.timeout(0);
			
			bot.setupDB(function(){
					
					fs.readFile(db.getDB().database, function(err, data){
						var j = JSON.parse(data)
						var test = { 
							dbname: 'foo',
							tables: { 
								foo: { 
									cols: ['id', 'nick', 'last_activity'],
									data: []
								},
								bar: {
									cols: ['id', 'nick', 'last_activity'],
									data: []
								} 
 							}
 						}
						assert.deepEqual(j, test)
						done()
					})
				})
		})

		it('Should update db with new row', function(done){

			var j = {
				flow: 'foo',
				users: expectedUsers
			}
			bot.updateDB(j, function(res){

				fs.readFile(db.getDB().database, function(err, data){
										var j = JSON.parse(data),
						test = [[22222,"fooness","2013-05-08T16:07:15.680Z"],[33333,"barness","2013-03-31T19:22:36.248Z"]]

					assert.deepEqual(j.tables['foo'].data, test)
					done()	
				})
			})
		})
	})// end Flowdock Model tests


	/**
	 * Logging tests
	 */
	describe('Logs', function(){
		
		it('Should build array of log events', function(done){

			//populate flows
			bot.parseFlows(mockResponse, function parseFlowsTestCB(resp){
				
				//populate with users
				for(var i in resp){

					//get new mockResponse
					mockResponse = require('../../lib/mockResponse').getMock()
					mockResponse.data = JSON.stringify(expectedUsers)
					mockResponse.req = {
						path: '/flows/'+bot.getConfig.FLOW_ORG+'/'+resp[i].parameterized_name
					}

					//populate users
					bot.parseUsers(mockResponse)
					mockResponse.run()		
				}

				//get log data
				bot.getLogData( function getLogDataTestCB(res){

					var expected = [
						{"id":22222,"flow":"foo","organization":"foo","nick":"fooness","last_activity":"2013-05-08T16:07:15.680Z"}
						,{"id":33333,"flow":"foo","organization":"foo","nick":"barness","last_activity":"2013-03-31T19:22:36.248Z"}
						,{"id":22222,"flow":"bar","organization":"foo","nick":"fooness","last_activity":"2013-05-08T16:07:15.680Z"}
						,{"id":33333,"flow":"bar","organization":"foo","nick":"barness","last_activity":"2013-03-31T19:22:36.248Z"}
					]
					assert.deepEqual(res, expected)
					done()
				})

			})
			mockResponse.run()
		})
		
		it('Should write data to log file', function(done){

			//create initial record in db
			var j = {
				flow: 'foo',
				users: expectedUsers
			}

			bot.updateDB(j, function(res){

				//if finished looping through expectedUsers

					fs.readFile(db.getDB().database, function(err, data){

						var j_db = JSON.parse(data)
						var testDate = new Date().getTime()

						//change date
						var oldDate = j.users[0].last_activity
						j.users[0].last_activity = testDate

						//check updated last_activity writes to log file
						bot.updateDB(j, function(res){

							
							//check last line of log file
							fs.readFile(bot.filename, 'utf-8', function(err, data){

								//vars
								var actual = []
									lines = data.trim()
									.split('\n')
									.forEach(function(line, i){
										actual.push(JSON.parse(line))
									})

								//build test array
								var test = []
								j.users[0].last_activity = oldDate
								j.users.forEach(function(user, i){

									test.push(
										JSON.stringify({
											id: user.id,
											flow: j.flow,
											organization: _config.FLOW_ORG,
											nick: user.nick,
											logged: actual[i].logged,
											last_activity: new Date(user.last_activity).toISOString()
										})
									)
								})
								test.push(
									JSON.stringify({
										id: j.users[0].id,
										flow: j.flow,
										organization: _config.FLOW_ORG,
										nick: j.users[0].nick,
										logged: actual[actual.length-1].logged,
										last_activity: new Date(testDate).toISOString()
									})
								)//end build test array

								//reset actual array to strings
								actual.forEach(function(event, i){
									actual[i] = JSON.stringify(event)
								})

								//test
								assert.deepEqual(test, actual)
								done()
							})
						})
					})
			})
		})

		it('Should create backup', function(done){

			var fooData
			bot.filename = process.cwd()+'/tests/logs/flowdock.log'
			bot.maxLogSize = 2

			
			
			//logfile data
			for(var i=1; i<50; i++)
				fooData += i+'\n'

			fs.appendFile(bot.filename, fooData, function createBackupUnitTest(err){

				if(err)
					throw new Error(err)

				//try backup
				bot.logBackup(function(ok){
					if(ok)
						done()
				})
			})
		})
	})
})

