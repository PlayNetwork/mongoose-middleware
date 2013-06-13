module.exports = function(mongoose) {
	'use strict';

	mongoose.Query.prototype.order = function (options) {
		if (!options || !options.sort) {
			return this;
		}

		var
			asc = [],
			desc = [],
			self = this,
			sort = options.sort || {},
			value = null;

		if (sort.desc) {
			if (!(sort.desc instanceof Array)) {
				desc.push(sort.desc);
			} else {
				desc = sort.desc;
			}

			desc.forEach(function (field) {
				value = {};
				value[field] = -1;
				self.sort(value);
			});
		}

		if (sort.asc) {
			if (!(sort.asc instanceof Array)) {
				asc.push(sort.asc);
			} else {
				asc = sort.asc;
			}

			asc.forEach(function (field) {
				value = {};
				value[field] = 1;
				self.sort(value);
			});
		}

		return self;
	};
};
