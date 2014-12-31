module.exports.initialize = function (options, mongoose) {
	'use strict';

	if (typeof mongoose === 'undefined') {
		mongoose = options;
		options = null;
	}

	// require all modules
	require('./field')(mongoose);
	require('./filter')(mongoose);
	require('./keyword')(mongoose);
	require('./order')(mongoose);

	// initialize page module
	var page = require('./page')(mongoose);

	if (options && options.maxDocs) {
		page.initialize(options);
	}
};
