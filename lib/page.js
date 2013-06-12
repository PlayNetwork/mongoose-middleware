var
	Query = require('mongoose').Query,

	maxResults = -1;

exports.initialize = function (maxResults) {
	'use strict';

	maxResults = maxResults;
};


Query.prototype.page = function (options, callback) {
	'use strict';

	var defaults = {
			start : 0,
			count : maxResults
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
