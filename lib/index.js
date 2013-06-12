var
	field = require('./field'),
	filter = require('./filter'),
	keyword = require('./keyword'),
	order = require('./order'),
	page = require('./page');

module.exports.initialize = function (options) {
	if (options && options.maxDocs) {
		page.initialize(options);
	}
};