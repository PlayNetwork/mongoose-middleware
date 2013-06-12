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
		it ('should add where clause for contains filter', function () {
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
		});
	});
});