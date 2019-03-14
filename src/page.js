export default (mongoose) => {
	let
		maxDocs = -1,
		self = {};

	function page (query, options) {
		return new Promise(function (resolve, reject) {
			return query.model.estimatedDocumentCount(query._conditions, function (err, total) {
				if (err) {
					return reject(err);
				}

				query.setOptions({
					limit : options.count,
					skip : options.start
				});

				return query.exec((err, results) => {
					if (err) {
						return reject(err);
					}

					return resolve({
						options,
						results : results || [],
						total
					});
				});
			});
		});
	}

	mongoose.Query.prototype.page = function (options, callback) {
		let
			defaults = {
				count : maxDocs,
				start : 0
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
			return page(query, options);
		}

		// execute and utilize the callback
		return page(query, options)
			.then(function (result) {
				return callback(null, result);
			})
			.catch(function (err) {
				return callback(err);
			});
	};

	self.initialize = (options) => {
		if (options) {
			maxDocs = options.maxDocs || maxDocs;
		}
	};

	return self;
};
