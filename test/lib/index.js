var mongoose = require('mongoose');

describe('index', function () {

	var
		fieldsSelected = [],
		indexLib = null,
		orClauseItems = [],
		sortClauseItems = [],
		whereClause = {};

	before(function () {
		indexLib = requireWithCoverage('index');

		Kitteh.count = function (search, countCallback) {
			countCallback(null, 0);
		};

		mongoose.Query.prototype.execFind = function (findCallback) {
			findCallback(null, []);
		};

		mongoose.Query.prototype.limit = function (input) {
			return this;
		};

		mongoose.Query.prototype.select = function (field) {
			if (field) {
				fieldsSelected.push(field);
			}
		};

		mongoose.Query.prototype.skip = function (input) {
			return this;
		};

		mongoose.Query.prototype.or = function (clause) {
			if (clause) {
				orClauseItems.push(clause);
			}
		};

		mongoose.Query.prototype.sort = function (clause) {
			if (clause) {
				sortClauseItems.push(clause);
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
		fieldsSelected = [];
		orClauseItems = [];
		sortClauseItems = [];
		whereClause = {};
	});

	it('should properly initialize options', function (done) {
		var options = {
			maxDocs : 1000
		};

		indexLib.initialize(options);

		Kitteh
			.find()
			.page(null, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.count.should.equals(1000);

				done();
			});
	});

	it('should properly require all middleware components', function (done) {
		var options = {
			filter : {
				field : ['name', 'home', 'features.color'],
				mandatory : {
					contains : {
						'features.color' : ['brindle', 'black', 'white']
					},
					exact : {
						name : 'Hamish'
					}
				},
				optional : {
					contains : {
						home : 'seattle'
					}
				}
			},
			sort : {
				desc : 'birthday',
				asc : 'name'
			},
			start : 0,
			count : 500
		};

		Kitteh
			.find()
			.field(options)
			.filter(options)
			.keyword(options)
			.order(options)
			.page(options, function (err, data) {
				should.not.exist(err);
				should.exist(data);

				done();
			});
	});
});