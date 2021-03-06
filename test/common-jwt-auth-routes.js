var Code = require('code'),
	expect = Code.expect,
	Lab = require('lab'),
	lab = exports.lab = Lab.script(),
	describe = lab.describe,
	it = lab.it,
	afterEach = lab.afterEach,
	before = lab.before,
	Sinon = require('sinon'),

	helpers = require('./test-helpers/index'),

	// test actors
	UserRoutes = require('../app/routes/user-routes'),
	GameRoutes = require('../app/routes/game-routes'),
	JWTAuth = require('../app/strategies/jwt-auth'),
	internals = {},
	testGroups = [
		{
			scope: '\/user\/profile',
			url: '/user/profile',
			routes: [
				UserRoutes.profileGET,
			]
		},
		{
			scope: '\/game\/data\/{key?}',
			url: '/game/data',
			routes: [
				GameRoutes.dataGET,
				GameRoutes.dataPOST
			]
		},
		{
			scope: '\/game\/score\/{key?}',
			url: '/game/score',
			routes: [
				GameRoutes.scoreGET,
				GameRoutes.scorePOST
			]
		},
		{
			scope: '\/game\/rank\/{scope}\/{key?}',
			url: '/game/rank/best/level_1_1',
			routes: [
				GameRoutes.rankGET
			]
		}
	];


testGroups.forEach(function (testGroup) {

	var requestUrl = testGroup.url;
	
	describe('Route authorisation: ' + testGroup.scope, function () {

		before(function (done) {
			internals.initServer(testGroup, done);
		});

		it('should authorise with valid signature', function (done) {
			var request = helpers.request.getValidRequest();
			request.url = requestUrl;
			helpers.server.inject(request, function (response) {
				expect(response.statusCode).to.equal(200);
				done();
			});
		});

		it('should not authorise without token', function (done) {
			var request = helpers.request.getMissingToken();
			request.url = requestUrl;
			helpers.server.inject(request, function (response) {
				expect(response.statusCode).to.equal(401);
				done();
			});
		});

		it('should not authorise with illegal token', function (done) {
			var request = helpers.request.getIllegalToken();
			request.url = requestUrl;
			helpers.server.inject(request, function (response) {
				expect(response.statusCode).to.equal(401);
				done();
			});
		});

		it('should not authorise without identification signature', function (done) {
			var request = helpers.request.getMissingIdent();
			request.url = requestUrl;
			helpers.server.inject(request, function (response) {
				expect(response.statusCode).to.equal(401);
				done();
			});
		});

		it('should not authorise with invalid identification udid', function (done) {
			var request = helpers.request.getInvalidIdentUDID();
			request.url = requestUrl;
			helpers.server.inject(request, function (response) {
				expect(response.statusCode).to.equal(401);
				done();
			})
		});

		it('should not authorise with invalid identification pkey', function (done) {
			var request = helpers.request.getInvalidIdentPKey();
			request.url = requestUrl;
			helpers.server.inject(request, function (response) {
				expect(response.statusCode).to.equal(401);
				done();
			})
		});

		it('should not authorise with illegal identification signature', function (done) {
			var request = helpers.request.getIllegalIndent();
			request.url = requestUrl;
			helpers.server.inject(request, function (response) {
				expect(response.statusCode).to.equal(401);
				done();
			})
		});
	});

	describe('Route authorisation: ' + testGroup.scope, function () {
		var findOneStub;
		
		before(function (done) {
			internals.initServer(testGroup, done);
		});

		afterEach(function (done) {
			findOneStub.restore();
			done();
		});

		it('should not authorise when db error occurs on ClientModel', function (done) {
			var ClientModel = require('../app/models/client'),
				request = helpers.request.getValidRequest();

			findOneStub = Sinon.stub(ClientModel, 'findOne', function (query, options, callback) {
				callback(new Error('some error'), null);
			});

			request.url = requestUrl;
			helpers.server.inject(request, function (response) {
				expect(response.statusCode).to.equal(500);
				done();
			});
		});
		
		it('should not authorise when db error occurs on GameModel', function (done) {
			var GameModel = require('../app/models/game'),
				request = helpers.request.getValidRequest();
			
			findOneStub = Sinon.stub(GameModel, 'findOne', function (query, options, callback) {
				callback(new Error('some error'), null);
			});

			request.url = requestUrl;
			helpers.server.inject(request, function (response) {
				expect(response.statusCode).to.equal(500);
				done();
			});
		});
		
	});

});

internals.initServer = function (testGroup, done) {
	helpers.initServer({
		strategies: [
			{
				name: 'jwt-auth',
				scheme: 'bearer-access-token',
				//mode: false,
				options: JWTAuth
			}
		],
		routes: testGroup.routes
	}, done);
};