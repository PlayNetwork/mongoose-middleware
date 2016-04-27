module.exports = function(mongoose) {
	'use strict';

	function sanitize(str) {
		// sanitizes regex escapes
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
		};

		var applyExists = function (spec) {
			for (var key in spec) {
				if (spec.hasOwnProperty(key)) {
					self.where(key).exists(analyzeWhereSpec(spec[key]));
				}
			}
		};

		var applyGreaterThan = function (spec) {
			for (var key in spec) {
				if (spec.hasOwnProperty(key)) {
					self.where(key).gt(spec[key]);
				}
			}
		};

		var applyGreaterThanEqual = function (spec) {
			for (var key in spec) {
				if (spec.hasOwnProperty(key)) {
					self.where(key).gte(spec[key]);
				}
			}
		};

		var applyLesserThan = function (spec) {
			for (var key in spec) {
				if (spec.hasOwnProperty(key)) {
					self.where(key).lt(spec[key]);
				}
			}
		};

		var applyLesserThanEqual = function (spec) {
			for (var key in spec) {
				if (spec.hasOwnProperty(key)) {
					self.where(key).lte(spec[key]);
				}
			}
		};

		var applyNotEqual = function (spec) {
			for (var key in spec) {
				if (spec.hasOwnProperty(key)) {
					self.where(key).ne(analyzeWhereSpec(spec[key]));
				}
			}
		};

		var applyRegex = function (spec, buildRegex) {
			var bulkApply = function (key, val) {
				val.forEach(function (term) {
					self.where(key, term);
				});
			};

			for (var key in spec) {
				if (spec.hasOwnProperty(key)) {
					var val = buildRegex(spec[key]);

					if (Array.isArray(val)) {
						bulkApply(key, val);
					} else {
						self.where(key, val);
					}
				}
			}
		};

		// mongoose.Query.prototype.or handles or clauses differently than
		// before. time was you could pass in a key value pair, now it looks
		// like it expects array of objects
		var applyRegexAsOptional = function (spec, buildRegex) {
			function bulkApply(key, val) {
				var
					node = {},
					nodeOptions = [];

				val.forEach(function (term) {
					node = {};
					node[key] = term;
					nodeOptions.push(node);
				});

				return nodeOptions;
			}

			var
				orOptions = [],
				orOptionsNode = {};

			for (var key in spec) {
				if (spec.hasOwnProperty(key)) {
					var val = buildRegex(spec[key]);

					if (Array.isArray(val)) {
						orOptions = orOptions.concat(bulkApply(key, val));
					} else {
						orOptionsNode = {};
						orOptionsNode[key] = val;
						orOptions.push(orOptionsNode);
					}
				}
			}

			if (orOptions.length > 0) {
				self.or(orOptions);
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

		applyExists(
			mandatory.exists || {});
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
		applyRegexAsOptional(optional.contains, regexContains);
		applyRegexAsOptional(optional.endsWith, regexEndsWith);
		applyRegexAsOptional(optional.startsWith, regexStartsWith);
		applyRegexAsOptional(optional.exact, regexExact);

		return self;
	};
};
