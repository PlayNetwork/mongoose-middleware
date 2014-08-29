module.exports = function(mongoose) {
	'use strict';

	var maxDocs = -1;

	var initialize = function (options) {
		if (options) {
			maxDocs = options.maxDocs || maxDocs;
		}
	};

	mongoose.Query.prototype.page = function (options, callback) {
		var defaults = {
				start : 0,
				count : maxDocs
			},
			query = this,
			wrap = {};

		options = options || defaults;
		options.start = (options && options.start ? options.start : defaults.start);
		options.count = (options && options.count ? options.count : defaults.count);

		if (maxDocs > 0 && (options.count > maxDocs || options.count === 0)) {
			options.count = maxDocs;
		}

		query.model.count(query._conditions, function (err, total) {
			if (err) {
				return callback(err, null);
			}

			query
				.skip(options.start)
				.limit(options.count)
				.exec(function (err, results) {
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

	return {
		initialize : initialize
	};
};
