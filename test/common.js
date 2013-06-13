global.mongoose = require('mongoose'),

global.requireWithCoverage = function (libName) {
	if (process.env.MONGOOSE_MIDDLEWARE_COVERAGE) {
		return require('../lib-cov/' + libName + '.js');
	}

	if (libName === 'index') {
		return require('../lib');
	} else {
		return require('../lib/' + libName + '.js');
	}
};

global.chai = require('chai');
global.expect = chai.expect;
global.Kitteh = mongoose.model(
	'kittehs',
	new mongoose.Schema({
		birthday : { type : Date, default : Date.now },
		features : {
			color : String,
			isFurreh : Boolean
		},
		home : String,
		name : String,
		peePatches : [String]
	})
);
global.should = chai.should();