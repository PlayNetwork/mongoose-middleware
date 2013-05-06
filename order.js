var Query = require('mongoose').Query;


Query.prototype.order = function (options) {
	'use strict';

	if (!options || !options.sort) {
		return this;
	}

	var
		key = null,
		self = this,
		sort = options.sort || {},
		value = null;

	// TODO: Apply sort direction
	//if (sort.desc) {

	//}

	if (sort.fields instanceof Array) {
		for (key in sort.fields) {
			if (sort.fields.hasOwnProperty(key)) {
				value = sort.fields[key];
				self.sort(value);
			}
		}
	} else {
		self.sort(sort.fields);
	}

	return self;
};