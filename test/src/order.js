import chai from 'chai';
import mongoose from 'mongoose';
import orderLib from '../../src/order';

const should = chai.should();

describe('order', () => {
	let
		Kitteh = mongoose.model('kittehs-order', new mongoose.Schema({
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
		})),
		sortClauseItems = [];

	before(() => {
		orderLib(mongoose);

		mongoose.Query.prototype.sort = (clause) => {
			if (clause) {
				sortClauseItems.push(clause);
			}
		};
	});

	beforeEach(() => {
		sortClauseItems = [];
	});

	it ('should return a query when created', () => {
		let query = Kitteh
			.find()
			.order(null);

		should.exist(query);
		(query instanceof mongoose.Query).should.equals(true);
	});

	it ('should sort fields in descending order when supplied', () => {
		let options = {
			sort : '-name'
		};

		Kitteh
			.find()
			.order(options);

		sortClauseItems.should.have.length(1);
		sortClauseItems[0].name.should.equals(-1);
	});

	it ('should sort fields in descending order when an array is supplied', () => {
		let options = {
			sort : ['-name', '-birthday']
		};

		Kitteh
			.find()
			.order(options);

		sortClauseItems.should.have.length(2);
		sortClauseItems[0].name.should.equals(-1);
		sortClauseItems[1].birthday.should.equals(-1);
	});

	it ('should sort fields in descending order when an object is supplied', () => {
		let options = {
			sort : {
				birthday : -1,
				name : -1
			}
		};

		Kitteh
			.find()
			.order(options);

		sortClauseItems.should.have.length(2);
		sortClauseItems[0].birthday.should.equals(-1);
		sortClauseItems[1].name.should.equals(-1);
	});

	it ('should sort fields in ascending order when supplied', () => {
		let options = {
			sort : ['name']
		};

		Kitteh
			.find()
			.order(options);

		sortClauseItems.should.have.length(1);
		sortClauseItems[0].name.should.equals(1);
	});

	it ('should sort fields in ascending order when an array is supplied', () => {
		let options = {
			sort : ['birthday', 'name']
		};

		Kitteh
			.find()
			.order(options);

		sortClauseItems.should.have.length(2);
		sortClauseItems[0].birthday.should.equals(1);
		sortClauseItems[1].name.should.equals(1);
	});

	it ('should sort fields in ascending order when an object is supplied', () => {
		let options = {
			sort : {
				birthday: 1,
				name: 1
			}
		};

		Kitteh
			.find()
			.order(options);

		sortClauseItems.should.have.length(2);
		sortClauseItems[0].birthday.should.equals(1);
		sortClauseItems[1].name.should.equals(1);
	});

	it ('should sort fields in both ascending and descending order when supplied as a string', () => {
		let options = {
			sort : 'home, -name'
		};

		Kitteh
			.find()
			.order(options);

		sortClauseItems.should.have.length(2);
		sortClauseItems[0].home.should.equals(1);
		sortClauseItems[1].name.should.equals(-1);
	});

	it ('should sort fields in both ascending and descending order when supplied as an array', () => {
		let options = {
			sort : ['home', '-name']
		};

		Kitteh
			.find()
			.order(options);

		sortClauseItems.should.have.length(2);
		sortClauseItems[0].home.should.equals(1);
		sortClauseItems[1].name.should.equals(-1);
	});

	it ('should sort fields in both ascending and descending order when supplied as an object', () => {
		let options = {
			sort : {
				'home': 1,
				'name': -1
			}
		};

		Kitteh
			.find()
			.order(options);

		sortClauseItems.should.have.length(2);
		sortClauseItems[0].home.should.equals(1);
		sortClauseItems[1].name.should.equals(-1);
	});

	it ('should sort fields in default ascending order when values in supplied object are not valid numbers', () => {
		let options = {
			sort : {
				'home': 1,
				'name': 'invalid number'
			}
		};

		Kitteh
			.find()
			.order(options);

		sortClauseItems.should.have.length(2);
		sortClauseItems[0].home.should.equals(1);
		sortClauseItems[1].name.should.equals(1);
	});

});
