var mongoose = require('mongoose');

describe('page', function () {

	var
		limit = 0,
		search = null,
		skip = 0;

	before(function () {
		requireWithCoverage('page');

		kitteh.count = function (search, countCallback) {
			countCallback(null, 0);
		};

		mongoose.Query.prototype.execFind = function (findCallback) {
			search = this._conditions;
			findCallback(null, []);
		};

		mongoose.Query.prototype.limit = function (limit) {
			limit = limit;
			return this;
		};

		mongoose.Query.prototype.skip = function (skip) {
			skip = skip;
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
				limit.should.equals(0);
				skip.should.equals(0);

				done();
			});
	});
});