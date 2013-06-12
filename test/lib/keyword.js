var mongoose = require('mongoose');

describe('keyword', function () {

	var orClauseItems = [];

	before(function () {
		requireWithCoverage('keyword');

		mongoose.Query.prototype.or = function (clause) {
			if (clause) {
				orClauseItems.push(clause);
			}
		};
	});

	beforeEach(function () {
		orClauseItems = [];
	});

	it ('should return a query when created', function () {
		var query = kitteh
			.find()
			.keyword(null);

		(query instanceof mongoose.Query).should.equals(true);
	});

	it ('should not filter if there are no fields specified', function () {
		var options = {
			filters : {
				keyword : {
					fields : null,
					term : 'cat'
				}
			}
		};

		var query = kitteh
			.find()
			.keyword(options);

		should.exist(query);
		orClauseItems.should.have.length(0);
	});

	it ('should apply search of keyword to specified fields', function () {
		var options = {
			filters : {
				keyword : {
					fields : ['name', 'features.color', 'home'],
					term : 'cat'
				}
			}
		};

		var query = kitteh
			.find()
			.keyword(options);

		should.exist(query);
		orClauseItems[0].should.have.length(3);
		orClauseItems[0][0].name.test('cat').should.equals(true);
		orClauseItems[0][0].name.test('spec-cat-acular').should.equals(true);
	});

	it ('should search for keyword occurrences with multiple words', function () {
		var options = {
			filters : {
				keyword : {
					fields : ['name', 'features.color', 'home'],
					term : 'ceiling cat'
				}
			}
		};

		var query = kitteh
			.find()
			.keyword(options);

		should.exist(query);
		orClauseItems[0].should.have.length(3);
		orClauseItems[0][0].name.test('floor cat').should.equals(false);
		orClauseItems[0][0].name.test('cat ceiling').should.equals(true);
		orClauseItems[0][0].name.test('ceilings are not for cats').should.equals(true);
	});

	it ('should search for exact match of multiple word keywords enclosed in quotes', function () {
		var options = {
			filters : {
				keyword : {
					fields : ['name', 'features.color', 'home'],
					term : '"ceiling cat"'
				}
			}
		};

		var query = kitteh
			.find()
			.keyword(options);

		should.exist(query);
		orClauseItems[0].should.have.length(3);
		orClauseItems[0][0].name.test('floor cat').should.equals(false);
		orClauseItems[0][0].name.test('cat ceiling').should.equals(false);
		orClauseItems[0][0].name.test('ceilings are not for cats').should.equals(false);
		orClauseItems[0][0].name.test('does ceiling cat exist?').should.equals(true);
	});
});
