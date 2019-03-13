export default (mongoose) => {
	mongoose.Query.prototype.order = function (options) {
		if (!options || !options.sort) {
			return this;
		}

		let
			fields = [],
			query = this,
			sort = options.sort || {},
			value = null;

		if (typeof sort === 'string') {
			fields = sort
				.split(/\,/g)
				.map((field) => field.trim());
		} else if (Array.isArray(sort) && sort.length) {
			fields = sort;
		} else if (typeof sort === 'object') {
			Object.keys(sort).forEach((property) => {
				if (!isNaN(sort[property])) {
					if (parseInt(sort[property], 10) < 0) {
						fields.push('-' + property);
					} else {
						fields.push(property);
					}
				} else {
					// property supplied is NaN; default to 1/ascending
					fields.push(property);
				}
			});
		}

		fields.forEach((field) => {
			value = {};
			if (field.startsWith('-')) {
				value[field.substring(1)] = -1;
			} else {
				value[field] = 1;
			}

			query.sort(value);
		});

		return query;
	};
};
