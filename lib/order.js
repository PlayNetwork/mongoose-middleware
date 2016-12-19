module.exports = function(mongoose) {
	'use strict';

	mongoose.Query.prototype.order = function (options) {
		if (!options || !options.sort) {
			return this;
		}

		var
			fields = [],
			self = this,
			sort = options.sort || {},
			value = null;

		if (typeof sort === 'string') {
			fields = sort.split(',');
			for (var index = 0; index < fields.length; index++) {
				fields[index] = fields[index].trim();
			}
		} else if (Array.isArray(sort) && sort.length) {
			fields = sort;
		} else if (typeof sort === 'object') {
			for (var property in sort) {
				if (sort[property] < 0) {
					fields.push('-' + property);
				} else {
					fields.push(property);
				}
			}
		}

		fields.forEach(function (field) {
			value = {};
			if (field.startsWith('-')) {
				value[field.substring(1)] = -1;
			} else {
				value[field] = 1;
			}

			self.sort(value);
		});

		return self;
	};
};
