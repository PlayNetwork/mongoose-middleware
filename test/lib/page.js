/* jshint -W030 */ // allows use of .empty
var
	chai = require('chai'),
	should = chai.should();


describe('page', function () {
	'use strict';

	var
		countError = null,
		execError = null,
		limit = 0,
		mongoose = require('mongoose'),
		pageLib = null,
		search = null,
		skip = 0,
		total = 1000;

	var Kitteh = mongoose.model('kittehs-page', new mongoose.Schema({
		birthday : { type : Date, default : Date.now },
		features : {
			color : String,
			isFurreh : Boolean
		},
		isDead: Boolean,
		home : String,
		name : String,
		peePatches : [String]
	}));

	before(function () {
		pageLib = require('../../lib/page')(mongoose);

		Kitteh.count = function (search, countCallback) {
			countCallback(countError, total);
		};

		mongoose.Query.prototype.exec = function (findCallback) {
			search = this._conditions;
			findCallback(execError, []);
		};

		mongoose.Query.prototype.limit = function (input) {
			limit = input;
			return this;
		};

		mongoose.Query.prototype.skip = function (input) {
			skip = input;
			return this;
		};
	});

	beforeEach(function () {
		countError = null;
		execError = null;
		limit = 0;
		search = null;
		skip = 0;
	});

	it('should pass search information to page', function (done) {
		Kitteh
			.find()
			.page(null, function (err, data) {
				should.not.exist(err);
				data.should.not.be.empty;
				skip.should.equals(0);

				return done();
			});
	});

	it('should default limit to maxDocs when specified at initialization', function (done) {
		pageLib.initialize({ maxDocs: 25 });

		Kitteh
			.find()
			.page(null, function (err, data) {
				should.not.exist(err);
				data.should.not.be.empty;
				limit.should.equals(25);
				skip.should.equals(0);

				return done();
			});
	});

	it('should default limit to maxDocs when 0 is supplied as count', function (done) {
		pageLib.initialize({ maxDocs: 25 });

		var options = {
			start : 0,
			count : 0
		};

		Kitteh
			.find()
			.page(options, function (err, data) {
				should.not.exist(err);
				data.should.not.be.empty;
				limit.should.equals(25);
				skip.should.equals(0);

				return done();
			});
	});

	it('should properly return error when one occurs during count', function (done) {
		countError = new Error('icanhazacounterr');

		Kitteh
			.find()
			.page(null, function (err, data) {
				should.exist(err);
				should.not.exist(data);

				return done();
			});
	});

	it('should properly return error when one occurs during exec', function (done) {
		execError = new Error('icanhazanexecerr');

		Kitteh
			.find()
			.page(null, function (err, data) {
				should.exist(err);
				should.not.exist(data);

				return done();
			});
	});

	it('should properly wrap the return data with input options', function (done) {
		var options = {
			start : 0,
			count : 50
		};

		pageLib.initialize({ maxDocs : -1 });

		Kitteh
			.find()
			.page(options, function (err, data) {
				should.not.exist(err);
				should.exist(data);

				data.options.start.should.equals(0);
				data.options.count.should.equals(50);
				data.results.should.be.empty;
				data.total.should.equals(total);

				return done();
			});
	});

	it('should not allow more than the maxDocs to be returned from a page request', function (done) {
		var options = {
			start : 0,
			count : 100
		};

		pageLib.initialize({ maxDocs: 50 });

		Kitteh
			.find()
			.page(options, function (err, data) {
				should.not.exist(err);
				should.exist(data);

				data.options.count.should.equals(50);

				return done();
			});
	});

	it('should return results when start is a string', function (done) {
		var options = {
			start : "0",
			count : 100
		};

		pageLib.initialize({ maxDocs: 50 });

		Kitteh
			.find()
			.page(options, function (err, data) {
				should.not.exist(err);
				should.exist(data);

				return done();
			});
	});

	it('should return results when start is NaN', function (done) {
		var options = {
			start : "start",
			count : 100
		};

		pageLib.initialize({ maxDocs: 50 });

		Kitteh
			.find()
			.page(options, function (err, data) {
				should.not.exist(err);
				should.exist(data);

				return done();
			});
	});

	it('should return results when count is a string', function (done) {
		var options = {
			start : 0,
			count : "100"
		};

		pageLib.initialize({ maxDocs: 50 });

		Kitteh
			.find()
			.page(options, function (err, data) {
				should.not.exist(err);
				should.exist(data);

				return done();
			});
	});

	it('should return results when count is NaN', function (done) {
		var options = {
			start : 0,
			count : "count"
		};

		pageLib.initialize({ maxDocs: 50 });

		Kitteh
			.find()
			.page(options, function (err, data) {
				should.not.exist(err);
				should.exist(data);

				data.options.count.should.equals(50);

				return done();
			});
	});
});
