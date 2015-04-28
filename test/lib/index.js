var
	chai = require('chai'),
	should = chai.should();


describe('index', function () {
	'use strict';

	var
		fieldsSelected = [],
		indexLib = null,
		mongoose = require('mongoose'),
		orClauseItems = [],
		sortClauseItems = [],
		whereClause = {};

	var Kitteh = mongoose.model('kittehs-index', new mongoose.Schema({
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
		indexLib = require('../../lib/index');
		indexLib.initialize(mongoose);

		Kitteh.count = function (search, countCallback) {
			countCallback(null, 0);
		};

		mongoose.Query.prototype.exec = function (findCallback) {
			findCallback(null, []);
		};

		mongoose.Query.prototype.limit = function () {
			return this;
		};

		mongoose.Query.prototype.select = function (field) {
			if (field) {
				fieldsSelected.push(field);
			}
		};

		mongoose.Query.prototype.skip = function () {
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
				},
				equals : function (value) {
					whereClause[key] = value;
				}
			};
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

		indexLib.initialize(options, mongoose);

		Kitteh
			.find()
			.page(null, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.count.should.equals(1000);

				return done();
			});
	});

	it('should properly require all middleware components', function (done) {
		var options = {
			filters : {
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

				return done();
			});
	});
});
