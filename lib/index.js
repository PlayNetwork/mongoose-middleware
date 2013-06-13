var mongooseLib = require('mongoose');

module.exports.initialize = function (options, mongoose) {
	if (!mongoose) {
		mongoose = options;
		options = null;
	}

	var
		field = require('./field')(mongoose),
		filter = require('./filter')(mongoose),
		keyword = require('./keyword')(mongoose),
		order = require('./order')(mongoose),
		page = require('./page')(mongoose);

	if (options && options.maxDocs) {
		page.initialize(options);
	}
};
