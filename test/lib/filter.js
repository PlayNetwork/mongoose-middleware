var mongoose = require('mongoose');

describe('filter', function () {

	var
		orClauseItems = [],
		whereClause = {};

	before(function () {
		requireWithCoverage('filter');

		mongoose.Query.prototype.or = function (clause) {
			if (clause) {
				orClauseItems.push(clause);
			}
		};

		mongoose.Query.prototype.where = function (key) {
			return {
				regex : function (value) {
					whereClause[key] = value;
				}
			}
		};
	});

	beforeEach(function () {
		orClauseItems = [];
		whereClause = {};
	});

	describe('mandatory filters', function () {
		it ('should look for occurrences of a term within a string using contains', function () {
			var options = {
				filters : {
					mandatory : {
						contains : {
							name : 'cat'
						}
					}
				}
			};

			var query = kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(whereClause.name);
			whereClause.name.test('cat').should.equals(true);
			whereClause.name.test('a cat exists').should.equals(true);
			whereClause.name.test('dog').should.equals(false);
		});

		it ('should look for occurrences of a term at the start of a string using startsWith', function () {
			var options = {
				filters : {
					mandatory : {
						startsWith : {
							name : 'cat'
						}
					}
				}
			};

			var query = kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(whereClause.name);
			whereClause.name.test('cat').should.equals(true);
			whereClause.name.test('cat exists').should.equals(true);
			whereClause.name.test('this cat is sick').should.equals(false);
		});

		it ('should look for occurrences of an exact match of the term when using exact', function () {
			var options = {
				filters : {
					mandatory : {
						exact : {
							name : 'cat'
						}
					}
				}
			};

			var query = kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(whereClause.name);
			whereClause.name.test('cat').should.equals(true);
			whereClause.name.test('cat litter').should.equals(false);
			whereClause.name.test('the cat').should.equals(false);
		});
	});

	describe('optional filters', function () {
		it ('should look for occurrences of a term within a string using contains', function () {
			var options = {
				filters : {
					optional : {
						contains : {
							name : 'cat'
						}
					}
				}
			};

			var query = kitteh
				.find()
				.filter(options);

			should.exist(query);
			orClauseItems.should.have.length(1);
		});

		it ('should look for occurrences of a term at the start of a string using startsWith', function () {
			var options = {
				filters : {
					optional : {
						startsWith : {
							name : 'cat'
						}
					}
				}
			};

			var query = kitteh
				.find()
				.filter(options);

			should.exist(query);
			orClauseItems.should.have.length(1);
		});

		it ('should look for occurrences of an exact match of the term when using exact', function () {
			var options = {
				filters : {
					optional : {
						exact : {
							name : 'cat'
						}
					}
				}
			};

			var query = kitteh
				.find()
				.filter(options);

			should.exist(query);
			orClauseItems.should.have.length(1);
		});
	});
});