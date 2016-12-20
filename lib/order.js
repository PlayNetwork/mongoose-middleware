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
			fields = sort.split(/\,/g).map(function (field) { return field.trim(); });
		} else if (Array.isArray(sort) && sort.length) {
			fields = sort;
		} else if (typeof sort === 'object') {
			Object.keys(sort).forEach(function (property) {
				if (!isNaN(sort[property])) {
					if (parseInt(sort[property], 10) < 0) {
						fields.push('-' + property);
					} else {
						fields.push(property);
					}
				} else {
					//property supplied is NaN; default to 1/ascending
					fields.push(property);
				}
			});
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
