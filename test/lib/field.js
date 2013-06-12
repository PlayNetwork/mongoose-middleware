var mongoose = require('mongoose');

describe('field', function () {

	var fieldsSelected = [];

	before(function () {
		requireWithCoverage('field');

		mongoose.Query.prototype.select = function (field) {
			if (field) {
				fieldsSelected.push(field);
			}
		};
	});

	beforeEach(function () {
		fieldsSelected = [];
	});

	it ('should only select fields supplied', function () {
		var options = {
			filters : {
				field : ['birthday', 'name']
			}
		};

		var query = kitteh
			.find()
			.field(options);

		should.exist(query);
		fieldsSelected.should.have.length(2);
	});

	it ('should select all model fields if not supplied', function () {
		var query = kitteh
			.find()
			.field(null);

		should.exist(query);
		fieldsSelected.should.have.length(0);
	});

});