export default (mongoose) => {
	const
		Query = mongoose.Query,
		Schema = mongoose.Schema;

	function getKeywordRegex (term) {
		let
			matches = [],
			pattern = '';

		// this splits the string at each space except those within double quotes
		matches = term.match(/\w+|"[^"]+"/g);

		// fix for #33 - empty keywords cause exception
		if (matches) {
			matches.forEach((t) => {
				// remove quotes
				t = t.replace(/\"/g, '');

				// sanitize for regex (strips everything except letters, numbers, underscores, single quotes and whitespace)
				t = t.replace(/\W\s/ig, '\\$&');

				// replace spaces with escapes
				t = t.replace(' ', '\\s');

				pattern += '(?=.*' + t + ')';
			});
		}

		return pattern;
	}


	Query.prototype.keyword = function (options) {
		// ensure keyword exists in query
		if (!options || !options.filters || !options.filters.keyword) {
			return this;
		}

		let
			fields = options.filters.keyword.fields || [],
			find = null,
			or = [],
			query = this,
			re = null,
			term = options.filters.keyword.term || '';

		if (!fields.length || term === '') {
			return query;
		}

		re = new RegExp(getKeywordRegex(term), 'i');
		fields.forEach((field) => {
			// field is an Array; use $in to incorperate keyword for search
			if (query.model.schema.path(field) && query.model.schema.path(field) instanceof Schema.Types.Array) {
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

		query.or(or);

		return query;
	};
};
