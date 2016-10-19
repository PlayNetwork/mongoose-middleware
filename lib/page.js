module.exports = function(mongoose) {
	'use strict';

	var
		maxDocs = -1,
		self = {};

	function page (options, query) {
		return new Promise(function (resolve, reject) {
			return query.model.count(query._conditions, function (err, total) {
				if (err) {
					return reject(err);
				}

				return query
					.skip(options.start)
					.limit(options.count)
					.exec(function (err, results) {
						if (err) {
							return reject(err);
						}

						return resolve({
							options : options,
							results : results || [],
							total : total
						});
					});
			});
		});
	}

	mongoose.Query.prototype.page = function (options, callback) {
		var
			defaults = {
				start : 0,
				count : maxDocs
			},
			query = this;

		options = options || defaults;
		// this might be getting a little long;
		options.start = (options && options.start && parseInt(options.start, 10) ? parseInt(options.start, 10) : defaults.start);
		options.count = (options && options.count && parseInt(options.count, 10) ? parseInt(options.count, 10) : defaults.count);

		if (maxDocs > 0 && (options.count > maxDocs || options.count === 0)) {
			options.count = maxDocs;
		}

		// if no callback is supplied, return a Promise
		if (typeof callback === 'undefined') {
			return page(options, query);
		}

		// execute and utilize the callback
		return page(options, query)
			.then(function (result) {
				return callback(null, result);
			})
			.catch(function (err) {
				return callback(err);
			});
	};

	self.initialize = function (options) {
		if (options) {
			maxDocs = options.maxDocs || maxDocs;
		}
	};

	return self;
};
