var Query = require('mongoose').Query;


Query.prototype.keyword = function (options) {
	'use strict';

	// ensure keyword exists in query
	if (!options || !options.filters || !options.filters.keyword) {
		return this;
	}

	var
		fields = options.filters.keyword.fields || [],
		find = {},
		i = 0,
		key = null,
		or = [],
		pattern = null,
		self = this,
		term = options.filters.keyword.term || '';

	// ensure search is not empty
	if (!fields.length || term === '') {
		return self;
	}

	// split the term on any whitespace
	term = term.replace(/\s+/g, ')(?=.*');
	pattern = new RegExp('(?=.*' + term + ')', 'i');

	for (i = 0; i < fields.length; i++) {
		find = {};
		find[fields[i]] = pattern;
		or.push(find);
	}

	self.or(or);

	return self;
};