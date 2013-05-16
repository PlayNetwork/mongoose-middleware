var Query = require('mongoose').Query;


function escapeRegex(str) {
	'use strict';

	// santizes regex escapes
	return str.replace(/\W\s/ig, '\\$&');
}


Query.prototype.filter = function (options) {
	'use strict';

	if (!options || !options.filters) {
		return this;
	}

	var
		key = null,
		mandatory = options.filters.mandatory || {},
		self = this,
		value = null;

	for (key in mandatory.contains) {
		if (mandatory.contains.hasOwnProperty(key)) {
			value = mandatory.contains[key];
			self.where(key).regex(new RegExp(escapeRegex(value), 'i'));
		}
	}

	for (key in mandatory.startsWith) {
		if (mandatory.startsWith.hasOwnProperty(key)) {
			value = mandatory.startsWith[key];
			self.where(key).regex(new RegExp('^' + escapeRegex(value), 'i'));
		}
	}

	for (key in mandatory.exact) {
		if (mandatory.exact.hasOwnProperty(key)) {
			value = mandatory.exact[key];
			self.where(key).regex(new RegExp('^' + escapeRegex(value) + '$', 'i'));
		}
	}

	return self;
};