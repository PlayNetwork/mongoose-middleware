requireCoverage('field');

var
	mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	Kitteh = mongoose.model(
		'kittehs',
		new Schema({
			birthday : { type : Date, default : Date.now },
			description : {
				color : String,
				isFurreh : Boolean
			},
			name : String
		})
	);

describe('field', function () {

	after(function (done) {
		done();
	});

	before(function (done) {
		/*mongoose.Query.prototype.model = {
			count : function (query, callback) {
				callback(null, 1);
			},
			execFind : function (query, callback) {
				callback(null, query);
			}
		}*/
		done();
	});

	it ('should only select fields supplied', function (done) {
		var options = {
			filters : {
				fields : ['birthday', 'name']
			}
		};

		var query = Kitteh
			.find()
			.fields(options);

		should.exist(query);
		done();
	});

});