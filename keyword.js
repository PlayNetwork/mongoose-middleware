/*jslint regexp : true */

var Query = require('mongoose').Query;


function getKeywordRegex(term) {
	'use strict';

	var
		matches = [],
		pattern = '';

	// this splits the string at each space except those within double quotes
	matches = term.match(/\w+|"[^"]+"/g);
	matches.forEach(function (t) {
		// remove quotes
		t = t.replace(/\"/g, '');

		// sanitize for regex (strips everything except letters, numbers, underscores, single quotes and whitespace)
		t = t.replace(/\W\s/ig, '\\$&');

		// replace spaces with escapes
		t = t.replace(' ', '\\s');

		pattern += '(?=.*' + t + ')';
	});

	return pattern;
}


Query.prototype.keyword = function (options) {
	'use strict';

	// ensure keyword exists in query
	if (!options || !options.filters || !options.filters.keyword) {
		return this;
	}

	var
		fields = options.filters.keyword.fields || [],
		find = null,
		or = [],
		re = null,
		self = this,
		term = options.filters.keyword.term || '';

	if (!fields.length || term === '') {
		return self;
	}

	re = new RegExp(getKeywordRegex(term), 'i');
	fields.forEach(function (field) {
		find = {};
		find[field] = re;
		or.push(find);
	});

	self.or(or);

	return self;
};