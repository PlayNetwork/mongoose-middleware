module.exports = function(mongoose) {
	'use strict';

	mongoose.Query.prototype.field = function (options) {
		var self = this;
		if (options && options.filters && options.filters.field) {
			if (typeof options.filters.field === 'string' && /\,/g.test(options.filters.field)) {
				options.filters.field = options.filters.field.split(/\,/g);
			}

			if (Array.isArray(options.filters.field) && options.filters.field.length) {
				options.filters.field.forEach(function (field) {
					if (self.model.schema.path(field)) {
						self.select(field.trim());
					}
				});
			} else {
				if (self.model.schema.path(options.filters.field)) {
					self.select(options.filters.field.trim());
				}
			}
		}

		return this;
	};
};
