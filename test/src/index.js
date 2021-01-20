/* eslint no-invalid-this : 0 */
/* eslint no-magic-numbers : 0 */
import chai from 'chai';
import indexLib from '../../src/index';
import mongoose from 'mongoose';

const should = chai.should();

describe('index', () => {
	let
		fieldsSelected = [],
		Kitteh = mongoose.model('kittehs-index', new mongoose.Schema({
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
		orClauseItems = [],
		sortClauseItems = [],
		whereClause = {};

	before(() => {
		indexLib.initialize(mongoose);

		Kitteh.countDocuments = (search, countCallback) => {
			countCallback(null, 0);
		};

		Kitteh.estimatedDocumentCount = (search, countCallback) => {
			countCallback(null, 0);
		};

		mongoose.Query.prototype.exec = (findCallback) => {
			findCallback(null, []);
		};

		mongoose.Query.prototype.limit = () => {
			return this;
		};

		mongoose.Query.prototype.select = (field) => {
			if (field) {
				fieldsSelected.push(field);
			}
		};

		mongoose.Query.prototype.skip = () => {
			return this;
		};

		mongoose.Query.prototype.or = (clause) => {
			if (clause) {
				orClauseItems.push(clause);
			}
		};

		mongoose.Query.prototype.sort = (clause) => {
			if (clause) {
				sortClauseItems.push(clause);
			}
		};

		mongoose.Query.prototype.where = (key) => {
			return {
				equals : (value) => {
					whereClause[key] = value;
				},
				regex : (value) => {
					whereClause[key] = value;
				}
			};
		};
	});

	beforeEach(() => {
		fieldsSelected = [];
		orClauseItems = [];
		sortClauseItems = [];
		whereClause = {};
	});

	it('should properly initialize options', (done) => {
		let options = {
			maxDocs : 1000
		};

		indexLib.initialize(options, mongoose);

		Kitteh
			.find()
			.page(null, (err, data) => {
				should.not.exist(err);
				should.exist(data);
				data.options.count.should.equals(1000);

				return done();
			});
	});

	it('should properly require all middleware components', (done) => {
		let options = {
			count : 500,
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
			sort: ['-birthday', 'name'],
			start : 0
		};

		Kitteh
			.find()
			.field(options)
			.filter(options)
			.keyword(options)
			.order(options)
			.page(options, (err, data) => {
				should.not.exist(err);
				should.exist(data);

				return done();
			});
	});
});
