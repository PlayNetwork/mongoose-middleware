import chai from 'chai';
import fieldLib from '../../src/field';
import mongoose from 'mongoose';

const should = chai.should();

describe('field', () => {
	let
		fieldsSelected = [],
		Kitteh = mongoose.model('kittehs-field', new mongoose.Schema({
			birthday : {
				default : Date.now,
				type : Date
			},
			features : {
				color : String,
				isFurreh : Boolean
			},
			home : String,
			isDead: Boolean,
			name : String,
			peePatches : [String]
		}));

	before(() => {
		fieldLib(mongoose);

		mongoose.Query.prototype.select = (field) => {
			if (field) {
				fieldsSelected.push(field);
			}
		};
	});

	beforeEach(() => {
		fieldsSelected = [];
	});

	it ('should return a query when created', () => {
		let query = Kitteh
			.find()
			.field(null);

		(query instanceof mongoose.Query).should.equals(true);
	});

	it ('should only select fields when multiple fields are supplied', () => {
		let options = {
			filters : {
				field : ['birthday', 'name']
			}
		};

		let query = Kitteh
			.find()
			.field(options);

		should.exist(query);
		fieldsSelected.should.have.length(2);
	});

	it ('should only select one field when one field is supplied', () => {
		let options = {
			filters : {
				field : ['name']
			}
		};

		let query = Kitteh
			.find()
			.field(options);

		should.exist(query);
		fieldsSelected.should.have.length(1);
		fieldsSelected[0].should.equals('name');
	});

	it ('should select one field when one field is supplied and not an array', () => {
		let options = {
			filters : {
				field : 'name'
			}
		};

		let query = Kitteh
			.find()
			.field(options);

		should.exist(query);
		fieldsSelected.should.have.length(1);
		fieldsSelected[0].should.equals('name');
	});

	it ('should select all fields when one field is supplied and not an array but does not exist in schema', () => {
		let options = {
			filters : {
				field : 'notinschema'
			}
		};

		let query = Kitteh
			.find()
			.field(options);

		should.exist(query);
		fieldsSelected.should.have.length(0);
	});

	it ('should select all model fields when options are null', () => {
		let query = Kitteh
			.find()
			.field(null);

		should.exist(query);
		fieldsSelected.should.have.length(0);
	});

	it ('should select all model fields when options contain filters, but not field', () => {
		let query = Kitteh
			.find()
			.field({ filters : {} });

		should.exist(query);
		fieldsSelected.should.have.length(0);
	});

	it ('should split comma delim strings when supplied for field', () => {
		let query = Kitteh
			.find()
			.field({ filters : { field : 'home,name,unknownField' } });

		should.exist(query);
		fieldsSelected.should.have.length(2);
	});
});
