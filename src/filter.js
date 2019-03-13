export default (mongoose) => {
	function analyzeWhereSpec (val) {
		if (typeof val === 'string') {
			switch (val.toLowerCase()) {
				case 'null' : return null;
				case 'true' : return true;
				case 'false' : return false;
				default :
					// use a regex to validate if val is a real parse-able number
					// javascript isNaN() treats a string such as '100000329e97' as
					// a legitimate number, which is not a desirable result
					// e.g. both Number('100000329e97'), parseInt('100000329e97')
					// yield a number 100000329, and isNaN('100000329e97') === false
					if (/^[-+]?[0-9]*\.?[0-9]+$/.test(val)) {
						// val is a number
						if (val.indexOf('.') > -1) {
							// val is a float
							return parseFloat(val);
						} else {
							return parseInt(val, 10);
						}
					}
			}
		}

		return val;
	}

	function applyExists (query, spec) {
		for (let key in spec) {
			if (spec.hasOwnProperty(key)) {
				query.where(key).exists(analyzeWhereSpec(spec[key]));
			}
		}
	}

	function applyGreaterThan (query, spec) {
		for (let key in spec) {
			if (spec.hasOwnProperty(key)) {
				query.where(key).gt(spec[key]);
			}
		}
	}

	function applyGreaterThanEqual (query, spec) {
		for (let key in spec) {
			if (spec.hasOwnProperty(key)) {
				query.where(key).gte(spec[key]);
			}
		}
	}

	function applyLesserThan (query, spec) {
		for (let key in spec) {
			if (spec.hasOwnProperty(key)) {
				query.where(key).lt(spec[key]);
			}
		}
	}

	function applyLesserThanEqual (query, spec) {
		for (let key in spec) {
			if (spec.hasOwnProperty(key)) {
				query.where(key).lte(spec[key]);
			}
		}
	}

	function applyNotEqual (query, spec) {
		for (let key in spec) {
			if (spec.hasOwnProperty(key)) {
				query.where(key).ne(analyzeWhereSpec(spec[key]));
			}
		}
	}

	function applyRegex (query, spec, buildRegex) {
		for (let key in spec) {
			if (spec.hasOwnProperty(key)) {
				let val = buildRegex(spec[key]);

				if (Array.isArray(val)) {
					val.forEach((term) => {
						query.where(key, term);
					});
				} else {
					query.where(key, val);
				}
			}
		}
	}

	function applyRegexAsOptional (query, spec, buildRegex) {
		let
			orOptions = [],
			orOptionsNode = {};

		for (let key in spec) {
			if (spec.hasOwnProperty(key)) {
				let val = buildRegex(spec[key]);

				if (Array.isArray(val)) {
					orOptions = orOptions.concat((() => {
						let
							node = {},
							nodeOptions = [];

						val.forEach((term) => {
							node = {};
							node[key] = term;
							nodeOptions.push(node);
						});

						return nodeOptions;
					})());
				} else {
					orOptionsNode = {};
					orOptionsNode[key] = val;
					orOptions.push(orOptionsNode);
				}
			}
		}

		if (orOptions.length > 0) {
			query.or(orOptions);
		}
	}

	function regexContains (val) {
		if (Array.isArray(val) && val.length) {
			return val.map(function (term) {
				return regexContains(term);
			});
		}

		if (typeof val === 'string') {
			return new RegExp(sanitize(val), 'i');
		}

		return val;
	}

	function regexEndsWith (val) {
		if (Array.isArray(val) && val.length) {
			return val.map(function (term) {
				return regexEndsWith(term);
			});
		}

		return new RegExp(sanitize(val) + '$', 'i');
	}

	function regexExact (val) {
		if (Array.isArray(val) && val.length) {
			return val.map(function (term) {
				return regexExact(term);
			});
		}

		val = analyzeWhereSpec(val);

		if (typeof val === 'string') {
			return new RegExp('^' + sanitize(val) + '$', 'i');
		}

		return val;
	}

	function regexStartsWith (val) {
		if (Array.isArray(val) && val.length) {
			return val.map(function (term) {
				return regexStartsWith(term);
			});
		}

		return new RegExp('^' + sanitize(val), 'i');
	}

	function sanitize (str) {
		// sanitizes regex escapes
		return str.replace(/[\W\s]/ig, '\\$&');
	}

	mongoose.Query.prototype.filter = function (options) {
		if (!options || !options.filters) {
			return this;
		}

		let
			mandatory = options.filters.mandatory || {},
			optional = options.filters.optional || {},
			query = this;

		// MANDATORY
		applyRegex(query, mandatory.contains, regexContains);
		applyRegex(query, mandatory.endsWith, regexEndsWith);
		applyRegex(query, mandatory.startsWith, regexStartsWith);
		applyRegex(query, mandatory.exact, regexExact);

		applyExists(
			query,
			mandatory.exists || {});
		applyGreaterThan(
			query,
			mandatory.greaterThan || mandatory.gt || {});
		applyGreaterThanEqual(
			query,
			mandatory.greaterThanEqual || mandatory.gte || {});
		applyLesserThan(
			query,
			mandatory.lessThan || mandatory.lt || {});
		applyLesserThanEqual(
			query,
			mandatory.lessThanEqual || mandatory.lte || {});
		applyNotEqual(
			query,
			mandatory.notEqual || mandatory.notEqualTo || mandatory.ne || {});

		// OPTIONAL
		applyRegexAsOptional(query, optional.contains, regexContains);
		applyRegexAsOptional(query, optional.endsWith, regexEndsWith);
		applyRegexAsOptional(query, optional.startsWith, regexStartsWith);
		applyRegexAsOptional(query, optional.exact, regexExact);

		return query;
	};
};
