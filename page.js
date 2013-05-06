/*jslint nomen : true */

var
	Query = require('mongoose').Query,

	config = require('../../config');


Query.prototype.page = function (options, callback) {
	'use strict';

	var defaults = {
			offset : 0,
			max : config.database.maxDocs
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
			.skip(options.offset)
			.limit(options.max)
			.execFind(function (err, results) {
				if (err) { return callback(err); }

				wrap = {
					options : options,
					results : results || [],
					total : total
				};

				callback(err, wrap);
			});
	});
};