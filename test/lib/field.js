var
	chai = require('chai'),
	should = chai.should();


describe('field', function () {
	'use strict';

	var
		fieldLib = null,
		fieldsSelected = [],
		mongoose = require('mongoose');

	var Kitteh = mongoose.model('kittehs-field', new mongoose.Schema({
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
		fieldLib = require('../../lib/field')(mongoose);

		mongoose.Query.prototype.select = function (field) {
			if (field) {
				fieldsSelected.push(field);
			}
		};
	});

	beforeEach(function () {
		fieldsSelected = [];
	});

	it ('should return a query when created', function () {
		var query = Kitteh
			.find()
			.field(null);

		(query instanceof mongoose.Query).should.equals(true);
	});

	it ('should only select fields when multiple fields are supplied', function () {
		var options = {
			filters : {
				field : ['birthday', 'name']
			}
		};

		var query = Kitteh
			.find()
			.field(options);

		should.exist(query);
		fieldsSelected.should.have.length(2);
	});

	it ('should only select one field when one field is supplied', function () {
		var options = {
			filters : {
				field : ['name']
			}
		};

		var query = Kitteh
			.find()
			.field(options);

		should.exist(query);
		fieldsSelected.should.have.length(1);
		fieldsSelected[0].should.equals('name');
	});

	it ('should select one field when one field is supplied and not an array', function () {
		var options = {
			filters : {
				field : 'name'
			}
		};

		var query = Kitteh
			.find()
			.field(options);

		should.exist(query);
		fieldsSelected.should.have.length(1);
		fieldsSelected[0].should.equals('name');
	});

	it ('should select all fields when one field is supplied and not an array but does not exist in schema', function () {
		var options = {
			filters : {
				field : 'notinschema'
			}
		};

		var query = Kitteh
			.find()
			.field(options);

		should.exist(query);
		fieldsSelected.should.have.length(0);
	});

	it ('should select all model fields when options are null', function () {
		var query = Kitteh
			.find()
			.field(null);

		should.exist(query);
		fieldsSelected.should.have.length(0);
	});

	it ('should select all model fields when options contain filters, but not field', function () {
		var query = Kitteh
			.find()
			.field({ filters : {} });

		should.exist(query);
		fieldsSelected.should.have.length(0);
	});

	it ('should split comma delim strings when supplied for field', function () {
		var query = Kitteh
			.find()
			.field({ filters : { field : 'home,name,unknownField' }});

		should.exist(query);
		fieldsSelected.should.have.length(2);
	});
});
