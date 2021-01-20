/* eslint no-magic-numbers : 0 */
/* eslint no-unused-expressions : 0 */
import chai from 'chai';
import mongoose from 'mongoose';
import pageLib from '../../src/page';

const should = chai.should();

describe('page', () => {
	let
		countError = null,
		documentCountCall = 0,
		estimatedDocumentCountCall = 0,
		execError = null,
		Kitteh = mongoose.model('kittehs-page', new mongoose.Schema({
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
		limit = 0,
		skip = 0,
		total = 1000;

	before(() => {
		pageLib(mongoose);

		Kitteh.countDocuments = (search, countCallback) => {
			documentCountCall ++;
			countCallback(countError, total);
		};

		Kitteh.estimatedDocumentCount = (search, countCallback) => {
			estimatedDocumentCountCall ++;
			countCallback(countError, total);
		};

		mongoose.Query.prototype.exec = function (findCallback) {
			findCallback(execError, []);
		};

		mongoose.Query.prototype.limit = function (input) {
			limit = input;
			return this;
		};

		mongoose.Query.prototype.skip = function (input) {
			skip = input;
			return this;
		};
	});

	beforeEach(() => {
		countError = null;
		documentCountCall = 0;
		estimatedDocumentCountCall = 0;
		execError = null;
		limit = 0;
		skip = 0;
	});

	it('should pass search information to page', (done) => {
		Kitteh
			.find()
			.page(null, (err, data) => {
				should.not.exist(err);
				data.should.not.be.empty;
				skip.should.equals(0);

				return done();
			});
	});

	it('should use estimatedDocumentCount by default', (done) => {
		pageLib(mongoose).initialize({ maxDocs : 25 });

		Kitteh
			.find()
			.page(null, (err) => {
				if (err) {
					return done(err);
				}

				estimatedDocumentCountCall.should.equal(1);
				documentCountCall.should.equal(0);

				return done();
			});
	});

	it('should use documentCount when specified in initialization', (done) => {
		pageLib(mongoose).initialize({ estimatedDocumentCount: false });

		Kitteh
			.find()
			.page(null, (err) => {
				if (err) {
					return done(err);
				}

				estimatedDocumentCountCall.should.equal(0);
				documentCountCall.should.equal(1);

				return done();
			});
	});

	it('should default limit to maxDocs when specified at initialization', (done) => {
		pageLib(mongoose).initialize({ maxDocs: 25 });

		Kitteh
			.find()
			.page(null, (err, data) => {
				should.not.exist(err);
				data.should.not.be.empty;
				limit.should.equals(25);
				skip.should.equals(0);

				return done();
			});
	});

	it('should default limit to maxDocs when 0 is supplied as count', (done) => {
		pageLib(mongoose).initialize({ maxDocs: 25 });

		let options = {
			count : 0,
			start : 0
		};

		Kitteh
			.find()
			.page(options, (err, data) => {
				should.not.exist(err);
				data.should.not.be.empty;
				limit.should.equals(25);
				skip.should.equals(0);

				return done();
			});
	});

	it('should properly return error when one occurs during count', (done) => {
		countError = new Error('icanhazacounterr');

		Kitteh
			.find()
			.page(null, (err, data) => {
				should.exist(err);
				should.not.exist(data);

				return done();
			});
	});

	it('should properly return error when one occurs during exec', (done) => {
		execError = new Error('icanhazanexecerr');

		Kitteh
			.find()
			.page(null, (err, data) => {
				should.exist(err);
				should.not.exist(data);

				return done();
			});
	});

	it('should properly wrap the return data with input options', (done) => {
		let options = {
			count : 50,
			start : 0
		};

		pageLib(mongoose).initialize({ maxDocs : -1 });

		Kitteh
			.find()
			.page(options, (err, data) => {
				should.not.exist(err);
				should.exist(data);

				data.options.start.should.equals(0);
				data.options.count.should.equals(50);
				data.data.should.be.empty;
				data.total.should.equals(total);

				return done();
			});
	});

	it('should not allow more than the maxDocs to be returned from a page request', (done) => {
		let options = {
			count : 100,
			start : 0
		};

		pageLib(mongoose).initialize({ maxDocs: 50 });

		Kitteh
			.find()
			.page(options, (err, data) => {
				should.not.exist(err);
				should.exist(data);

				data.options.count.should.equals(50);

				return done();
			});
	});

	it('should return results when start is a string', (done) => {
		let options = {
			count : 100,
			start : '0'
		};

		pageLib(mongoose).initialize({ maxDocs: 50 });

		Kitteh
			.find()
			.page(options, (err, data) => {
				should.not.exist(err);
				should.exist(data);

				return done();
			});
	});

	it('should return results when start is NaN', (done) => {
		let options = {
			count : 100,
			start : 'start'
		};

		pageLib(mongoose).initialize({ maxDocs: 50 });

		Kitteh
			.find()
			.page(options, (err, data) => {
				should.not.exist(err);
				should.exist(data);

				return done();
			});
	});

	it('should return results when count is a string', (done) => {
		let options = {
			count : '100',
			start : 0
		};

		pageLib(mongoose).initialize({ maxDocs: 50 });

		Kitteh
			.find()
			.page(options, (err, data) => {
				should.not.exist(err);
				should.exist(data);

				return done();
			});
	});

	it('should return results when count is NaN', (done) => {
		let options = {
			count : 'count',
			start : 0
		};

		pageLib(mongoose).initialize({ maxDocs: 50 });

		Kitteh
			.find()
			.page(options, (err, data) => {
				should.not.exist(err);
				should.exist(data);

				data.options.count.should.equals(50);

				return done();
			});
	});

	it('should return a Promise when callback is not specified', (done) => {
		let options = {
			count : 50,
			start : 0
		};

		pageLib(mongoose).initialize({ maxDocs : -1 });

		Kitteh
			.find()
			.page(options)
			.then((data) => {
				should.exist(data);

				data.options.start.should.equals(0);
				data.options.count.should.equals(50);
				data.data.should.be.empty;
				data.total.should.equals(total);

				return done();
			})
			.catch(done);
	});
});
