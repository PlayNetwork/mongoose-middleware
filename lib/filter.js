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

		var applyGreaterThan = function (spec, isOptional) {
			if (typeof isOptional === 'undefined') {
				isOptional = false;
			}

			for (var key in spec) {
				if (spec.hasOwnProperty(key)) {
					(isOptional ? self.or(key) : self.where(key)).gt(spec[key]);
				}
			}
		};

		var applyGreaterThanEqual = function (spec, isOptional) {
			if (typeof isOptional === 'undefined') {
				isOptional = false;
			}

			for (var key in spec) {
				if (spec.hasOwnProperty(key)) {
					(isOptional ? self.or(key) : self.where(key)).gte(spec[key]);
				}
			}
		};

		var applyLesserThan = function (spec, isOptional) {
			if (typeof isOptional === 'undefined') {
				isOptional = false;
			}

			for (var key in spec) {
				if (spec.hasOwnProperty(key)) {
					(isOptional ? self.or(key) : self.where(key)).lt(spec[key]);
				}
			}
		};

		var applyLesserThanEqual = function (spec, isOptional) {
			if (typeof isOptional === 'undefined') {
				isOptional = false;
			}

			for (var key in spec) {
				if (spec.hasOwnProperty(key)) {
					(isOptional ? self.or(key) : self.where(key)).lte(spec[key]);
				}
			}
		};

		var applyNotEqual = function (spec, isOptional) {
			if (typeof isOptional === 'undefined') {
				isOptional = false;
			}

			for (var key in spec) {
				if (spec.hasOwnProperty(key)) {
					(isOptional ? self.or(key) : self.where(key))
						.ne(analyzeWhereSpec(spec[key]));
				}
			}
		};

		var applyRegex = function (spec, buildRegex, isOptional) {
			if (typeof isOptional === 'undefined') {
				isOptional = false;
			}

			var orOptionsNode = {};

			var bulkApply = function (key, val) {
				val.forEach(function (term) {
					if (isOptional) {
						orOptionsNode = {};
						orOptionsNode[key] = term;
						self.or([orOptionsNode]);
					} else {
						self.where(key, term);
					}
				});
			};

			for (var key in spec) {
				if (spec.hasOwnProperty(key)) {
					var val = buildRegex(spec[key]);

					if (Array.isArray(val)) {
						bulkApply(key, val);
					} else {
						if (isOptional) {
							orOptionsNode = {};
							orOptionsNode[key] = val;
							self.or([orOptionsNode]);
						} else {
							self.where(key, val);
						}
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
		applyRegex(mandatory.contains, regexContains);
		applyRegex(mandatory.endsWith, regexEndsWith);
		applyRegex(mandatory.startsWith, regexStartsWith);
		applyRegex(mandatory.exact, regexExact);

		applyGreaterThan(
			mandatory.greaterThan || mandatory.gt || {});
		applyGreaterThanEqual(
			mandatory.greaterThanEqual || mandatory.gte || {});
		applyLesserThan(
			mandatory.lessThan || mandatory.lt || {});
		applyLesserThanEqual(
			mandatory.lessThanEqual || mandatory.lte || {});
		applyNotEqual(
			mandatory.notEqual || mandatory.notEqualTo || mandatory.ne || {});

		// OPTIONAL
		applyRegex(optional.contains, regexContains, true);
		applyRegex(optional.endsWith, regexEndsWith, true);
		applyRegex(optional.startsWith, regexStartsWith, true);
		applyRegex(optional.exact, regexExact, true);

		applyGreaterThan(
			optional.greaterThan || optional.gt || {},
			true);
		applyGreaterThanEqual(
			optional.greaterThanEqual || optional.gte || {},
			true);
		applyLesserThan(
			optional.lessThan || optional.lt || {},
			true);
		applyLesserThanEqual(
			optional.lessThanEqual || optional.lte || {},
			true);
		applyNotEqual(
			optional.notEqual || optional.notEqualTo || optional.ne || {},
			true);

		return self;
	};
};
