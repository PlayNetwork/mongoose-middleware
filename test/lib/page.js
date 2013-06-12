var mongoose = require('mongoose');

describe('page', function () {

	var
		limit = 0,
		pageLib = null,
		search = null,
		skip = 0;

	before(function () {
		pageLib = requireWithCoverage('page');

		kitteh.count = function (search, countCallback) {
			countCallback(null, 0);
		};

		mongoose.Query.prototype.execFind = function (findCallback) {
			search = this._conditions;
			findCallback(null, []);
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
		limit = 0;
		search = null;
		skip = 0;
	});

	it ('should pass search information to page', function (done) {
		kitteh
			.find()
			.page(null, function (err, data) {
				should.not.exist(err);
				data.should.not.be.empty;
				limit.should.equals(-1);
				skip.should.equals(0);

				done();
			});
	});

	it ('should default limit to maxDocs when specified at initialization', function (done) {
		pageLib.initialize({ maxDocs: 25 });

		kitteh
			.find()
			.page(null, function (err, data) {
				should.not.exist(err);
				data.should.not.be.empty;
				limit.should.equals(25);
				skip.should.equals(0);

				done();
			});
	});
});