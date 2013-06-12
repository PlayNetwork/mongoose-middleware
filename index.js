var
	field = require('lib/field'),
	filter = require('lib/filter'),
	keyword = require('lib/keyword'),
	order = require('lib/order'),
	page = require('lib/page');

module.exports.initialize = function (options) {
	if (options && options.maxResults) {
		page.initialize(options.maxResults);
	}
};