var
	Query = require('mongoose').Query,

	maxDocs = -1;

exports.initialize = function (config) {
	'use strict';

	maxDocs = config.maxDocs;
};


Query.prototype.page = function (options, callback) {
	'use strict';

	var defaults = {
			start : 0,
			count : maxDocs
		},
		query = this,
		wrap = {};

	options = options || defaults;

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
