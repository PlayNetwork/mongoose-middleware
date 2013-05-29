/*jslint nomen : true */

var
	Query = require('mongoose').Query,

	config = {};

exports.initialize = function (options) {
	'use strict';

	config = options.config;
};


Query.prototype.page = function (options, callback) {
	'use strict';

	var defaults = {
			start : 0,
			count : config.database.maxDocs
		},
		query = this,
		wrap = {};

	options = options || defaults;

	// fix to keep from no max being specified slipping through
	if (!options.max) {
		options.max = defaults.max;
	}

	query.model.count(query._conditions, function (err, total) {
		query
			.skip(options.start)
			.limit(options.count)
			.execFind(function (err, results) {
				if (err) {
					return callback(err);
				}

				wrap = {
					options : options,
					results : results || [],
					total : total
				};

				callback(err, wrap);
			});
	});
};
