module.exports = function(mongoose) {
	'use strict';

	function sanitize(str) {
		// santizes regex escapes
		return str.replace(/[\W\s]/ig, '\\$&');
	}

	mongoose.Query.prototype.filter = function (options) {
		if (!options || !options.filters) {
			return this;
		}

		var
			mandatory = options.filters.mandatory || {},
			optional = options.filters.optional || {},
			self = this;

		var analyzeWhereSpec = function (val) {
			if (typeof val === 'string') {
				switch (val.toLowerCase()) {
					case 'null' : return null;
					case 'true' : return true;
					case 'false' : return false;
					default :
						if (!isNaN(val)) {
							// val is a number
							if (val.indexOf('.') > -1) {
								// val is a float
								return parseFloat(val);
							} else {
								return parseInt(val);
							}
						}
				}
			}

			return val;
		};

		var applyGreaterThan = function (spec, clause) {
			for (var key in spec) {
				if (spec.hasOwnProperty(key)) {
					clause(key).gt(spec[key]);
				}
			}
		};

		var applyGreaterThanEqual = function (spec, clause) {
			for (var key in spec) {
				if (spec.hasOwnProperty(key)) {
					clause(key).gte(spec[key]);
				}
			}
		};

		var applyLesserThan = function (spec, clause) {
			for (var key in spec) {
				if (spec.hasOwnProperty(key)) {
					clause(key).lt(spec[key]);
				}
			}
		};

		var applyLesserThanEqual = function (spec, clause) {
			for (var key in spec) {
				if (spec.hasOwnProperty(key)) {
					clause(key).lte(spec[key]);
				}
			}
		};

		var applyNotEqual = function (spec, clause) {
			for (var key in spec) {
				if (spec.hasOwnProperty(key)) {
					clause(key).ne(analyzeWhereSpec(spec[key]));
				}
			}
		};

		var applyRegex = function (spec, buildRegex, clause) {
			var bulkApply = function (key, val) {
				val.forEach(function (term) {
					clause(key, term);
				});
			};

			for (var key in spec) {
				if (spec.hasOwnProperty(key)) {
					var val = buildRegex(spec[key]);

					if (Array.isArray(val)) {
						bulkApply(key, val);
					} else {
						clause(key, val);
					}
				}
			}
		};

		var regexContains = function (val) {
			if (Array.isArray(val) && val.length) {
				return val.map(function (term) {
					return regexContains(term);
				});
			}

			if (typeof val === 'string') {
				return new RegExp(sanitize(val), 'i');
			}

			return val;
		};

		var regexEndsWith = function (val) {
			if (Array.isArray(val) && val.length) {
				return val.map(function (term) {
					return regexEndsWith(term);
				});
			}

			return new RegExp(sanitize(val) + '$', 'i');
		};

		var regexExact = function (val) {
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
		};

		var regexStartsWith = function (val) {
			if (Array.isArray(val) && val.length) {
				return val.map(function (term) {
					return regexStartsWith(term);
				});
			}

			return new RegExp('^' + sanitize(val), 'i');
		};

		// MANDATORY
		applyRegex(mandatory.contains, regexContains, self.where);
		applyRegex(mandatory.endsWith, regexEndsWith, self.where);
		applyRegex(mandatory.startsWith, regexStartsWith, self.where);
		applyRegex(mandatory.exact, regexExact, self.where);

		applyGreaterThan(
			mandatory.greaterThan || mandatory.gt || {},
			self.where);
		applyGreaterThanEqual(
			mandatory.greaterThanEqual || mandatory.gte || {},
			self.where);
		applyLesserThan(
			mandatory.lessThan || mandatory.lt || {},
			self.where);
		applyLesserThanEqual(
			mandatory.lessThanEqual || mandatory.lte || {},
			self.where);
		applyNotEqual(
			mandatory.notEqual || mandatory.notEqualTo || mandatory.ne || {},
			self.where);

		// OPTIONAL
		applyRegex(optional.contains, regexContains, self.or);
		applyRegex(optional.endsWith, regexEndsWith, self.or);
		applyRegex(optional.startsWith, regexStartsWith, self.or);
		applyRegex(optional.exact, regexExact, self.or);

		applyGreaterThan(
			optional.greaterThan || optional.gt || {},
			self.or);
		applyGreaterThanEqual(
			optional.greaterThanEqual || optional.gte || {},
			self.or);
		applyLesserThan(
			optional.lessThan || optional.lt || {},
			self.or);
		applyLesserThanEqual(
			optional.lessThanEqual || optional.lte || {},
			self.or);
		applyNotEqual(
			optional.notEqual || optional.notEqualTo || optional.ne || {},
			self.or);

		return self;
	};
};
