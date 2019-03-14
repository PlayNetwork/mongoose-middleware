export default (mongoose) => {
	mongoose.Query.prototype.field = function (options) {
		let query = this;

		if (options && options.filters && options.filters.field) {
			if (typeof options.filters.field === 'string' && /\,/g.test(options.filters.field)) {
				options.filters.field = options.filters.field.split(/\,/g);
			}

			if (Array.isArray(options.filters.field) && options.filters.field.length) {
				options.filters.field.forEach((field) => {
					if (query.model.schema.path(field)) {
						query.select(field.trim());
					}
				});
			} else if (query.model.schema.path(options.filters.field)) {
				query.select(options.filters.field.trim());
			}
		}

		return query;
	};
};
