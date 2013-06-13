module.exports = function(mongoose) {
	'use strict';

	mongoose.Query.prototype.field = function (options) {
		var self = this;

		if (options && options.filters && options.filters.field) {
			if (options.filters.field instanceof Array && options.filters.field.length) {
				options.filters.field.forEach(function (field) {

					if (self.model.schema.path(field)) {
						self.select(field);
					}
				});
			} else {
				if (self.model.schema.path(options.filters.field)) {
					self.select(options.filters.field);
				}
			}
		}

		return this;
	};
};
