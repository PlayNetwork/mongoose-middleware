/* eslint no-magic-numbers : 0 */
import chai from 'chai';
import keywordLib from '../../src/keyword';
import mongoose from 'mongoose';

const should = chai.should();

describe('keyword', () => {
	let
		Kitteh = mongoose.model('kittehs-keyword', new mongoose.Schema({
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
		orClauseItems = [];

	before(() => {
		keywordLib(mongoose);

		mongoose.Query.prototype.or = (clause) => {
			if (clause) {
				orClauseItems.push(clause);
			}
		};
	});

	beforeEach(() => {
		orClauseItems = [];
	});

	it ('should return a query when created', () => {
		let query = Kitteh
			.find()
			.keyword(null);

		(query instanceof mongoose.Query).should.equals(true);
	});

	it ('should not filter if there are no fields specified', () => {
		let options = {
			filters : {
				keyword : {
					fields : null,
					term : 'cat'
				}
			}
		};

		let query = Kitteh
			.find()
			.keyword(options);

		should.exist(query);
		orClauseItems.should.have.length(0);
	});

	it ('should not filter if there is no term specified', () => {
		let options = {
			filters : {
				keyword : {
					fields : null,
					term : ''
				}
			}
		};

		let query = Kitteh
			.find()
			.keyword(options);

		should.exist(query);
		orClauseItems.should.have.length(0);
	});

	it ('should apply search of keyword to specified fields', () => {
		let options = {
			filters : {
				keyword : {
					fields : ['name', 'features.color', 'home'],
					term : 'cat'
				}
			}
		};

		let query = Kitteh
			.find()
			.keyword(options);

		should.exist(query);
		orClauseItems[0].should.have.length(3);
		orClauseItems[0][0].name.test('cat').should.equals(true);
		orClauseItems[0][0].name.test('spec-cat-acular').should.equals(true);
	});

	it ('should search matches in arrays when a property within a schema is an array', () => {
		let options = {
			filters : {
				keyword : {
					fields : ['name', 'peePatches'],
					term : 'lawn'
				}
			}
		};

		let query = Kitteh
			.find()
			.keyword(options);

		should.exist(query);
		orClauseItems[0].should.have.length(2);
		should.exist(orClauseItems[0][1].peePatches.$in);
	});

	it ('should search for keyword occurrences with multiple words', () => {
		let options = {
			filters : {
				keyword : {
					fields : ['name', 'features.color', 'home'],
					term : 'ceiling cat'
				}
			}
		};

		let query = Kitteh
			.find()
			.keyword(options);

		should.exist(query);
		orClauseItems[0].should.have.length(3);
		orClauseItems[0][0].name.test('floor cat').should.equals(false);
		orClauseItems[0][0].name.test('cat ceiling').should.equals(true);
		orClauseItems[0][0].name.test('ceilings are not for cats').should.equals(true);
	});

	it ('should search for exact match of multiple word keywords enclosed in quotes', () => {
		let options = {
			filters : {
				keyword : {
					fields : ['name', 'features.color', 'home'],
					term : '"ceiling cat"'
				}
			}
		};

		let query = Kitteh
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
