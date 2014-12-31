var
	chai = require('chai'),
	should = chai.should();


describe('order', function () {
	'use strict';

	var
		mongoose = require('mongoose'),
		orderLib = null,
		sortClauseItems = [];

	var Kitteh = mongoose.model('kittehs-order', new mongoose.Schema({
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
		orderLib = require('../../lib/order')(mongoose);

		mongoose.Query.prototype.sort = function (clause) {
			if (clause) {
				sortClauseItems.push(clause);
			}
		};
	});

	beforeEach(function () {
		sortClauseItems = [];
	});

	it ('should return a query when created', function () {
		var query = Kitteh
			.find()
			.order(null);

		should.exist(query);
		(query instanceof mongoose.Query).should.equals(true);
	});

	it ('should sort fields in descending order when supplied', function () {
		var options = {
			sort : {
				desc : 'name'
			}
		};

		Kitteh
			.find()
			.order(options);

		sortClauseItems.should.have.length(1);
		sortClauseItems[0].name.should.equals(-1);
	});

	it ('should sort fields in descending order when an array is supplied', function () {
		var options = {
			sort : {
				desc : ['name', 'birthday']
			}
		};

		Kitteh
			.find()
			.order(options);

		sortClauseItems.should.have.length(2);
		sortClauseItems[0].name.should.equals(-1);
		sortClauseItems[1].birthday.should.equals(-1);
	});

	it ('should sort fields in ascending order when supplied', function () {
		var options = {
			sort : {
				asc : 'name'
			}
		};

		Kitteh
			.find()
			.order(options);

		sortClauseItems.should.have.length(1);
		sortClauseItems[0].name.should.equals(1);
	});

	it ('should sort fields in ascending order when an array is supplied', function () {
		var options = {
			sort : {
				asc : ['name', 'birthday']
			}
		};

		Kitteh
			.find()
			.order(options);

		sortClauseItems.should.have.length(2);
		sortClauseItems[0].name.should.equals(1);
		sortClauseItems[1].birthday.should.equals(1);
	});

	it ('should sort fields in both ascending and descending order when supplied', function () {
		var options = {
			sort : {
				asc : ['home'],
				desc : ['name']
			}
		};

		Kitteh
			.find()
			.order(options);

		sortClauseItems.should.have.length(2);
		sortClauseItems[0].name.should.equals(-1);
		sortClauseItems[1].home.should.equals(1);
	});
});
