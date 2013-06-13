module.exports = function(mongoose) {
	'use strict';

	var
		Query = mongoose.Query,
		Schema = mongoose.Schema;


	function getKeywordRegex(term) {
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
			// field is an Array; use $in to incorperate keyword for search
			if (self.model.schema.path(field) && self.model.schema.path(field) instanceof Schema.Types.Array) {
				find = {};
				find[field] = {};
				find[field].$in = [re];
				or.push(find);
			} else {
				find = {};
				find[field] = re;
				or.push(find);
			}
		});

		self.or(or);

		return self;
	};
};
