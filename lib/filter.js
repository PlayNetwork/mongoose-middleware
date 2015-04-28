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

		var applyWhere = function (spec, buildRegex) {
			for (var key in spec) {
				if (spec.hasOwnProperty(key)) {
					var val = buildRegex(spec[key]);

					self.where(key, val);
				}
			}
		};

		var applyWhereGreaterThan = function (spec) {
			for (var key in spec) {
				if (spec.hasOwnProperty(key)) {
					self.where(key).gt(spec[key]);
				}
			}
		};

		var applyWhereGreaterThanEqual = function (spec) {
			for (var key in spec) {
				if (spec.hasOwnProperty(key)) {
					self.where(key).gte(spec[key]);
				}
			}
		};

		var applyWhereLesserThan = function (spec) {
			for (var key in spec) {
				if (spec.hasOwnProperty(key)) {
					self.where(key).lt(spec[key]);
				}
			}
		};

		var applyWhereLesserThanEqual = function (spec) {
			for (var key in spec) {
				if (spec.hasOwnProperty(key)) {
					self.where(key).lte(spec[key]);
				}
			}
		};

		var applyOptionals = function(optional) {
			var items = [];

			var populate = function (key, value, buildRegex) {
				var
					items = [],
					item = {};

				if (value instanceof Array && value.length) {
					value.forEach(function (val) {
						item = {};
						item[key] = buildRegex(val);
						items.push(item);
					});

					return items;
				} else {
					item[key] = buildRegex(value);

					return item;
				}
			};

			var parse = function(spec, buildRegex) {
				var
					parsedItems = null,
					result = null;

				if (!spec) {
					return null;
				}

				for (var key in spec) {
					if (spec.hasOwnProperty(key)) {
						result = populate(key, spec[key], buildRegex);

						if (result instanceof Array && result.length) {
							parsedItems = result;
						} else {
							if (!parsedItems) {
								parsedItems = [];
							}

							parsedItems.push(result);
						}
					}
				}
				return parsedItems;
			};

			items = parse(optional.contains, regexContains);
			if (items && items instanceof Array && items.length) {
				self.or(items);
			}

			items = parse(optional.endsWith, regexEndsWith);
			if (items && items instanceof Array && items.length) {
				self.or(items);
			}

			items = parse(optional.startsWith, regexStartsWith);
			if (items && items instanceof Array && items.length) {
				self.or(items);
			}

			items = parse(optional.exact, regexExact);
			if (items && items instanceof Array && items.length) {
				self.or(items);
			}
		};

		var regexContains = function (val) {
			if (typeof val === 'string') {
				return new RegExp(sanitize(val), 'i');
			}

			return val;
		};

		/**
		 * Assumes field type is a string
		 **/
		var regexEndsWith = function (val) {
			return new RegExp(sanitize(val) + '$', 'i');
		};

		var regexExact = function (val) {
			if (isNaN(val) && typeof val === 'string') {
				switch(val.toLowerCase()) {
					case 'false' :
						return false;
					case 'true' :
						return true;
					default :
						return new RegExp('^' + sanitize(val) + '$', 'i');
				}
			}

			return val;
		};

		/**
		 * Assumes field type is a string
		 **/
		var regexStartsWith = function (val) {
			return new RegExp('^' + sanitize(val), 'i');
		};

		// MANDATORY
		applyWhere(mandatory.contains, regexContains);
		applyWhere(mandatory.endsWith, regexEndsWith);
		applyWhere(mandatory.startsWith, regexStartsWith);
		applyWhere(mandatory.exact, regexExact);

		applyWhereGreaterThan(mandatory.greaterThan || mandatory.gt || {});
		applyWhereGreaterThanEqual(mandatory.greaterThanEqual || mandatory.gte || {});
		applyWhereLesserThan(mandatory.lessThan || mandatory.lt || {});
		applyWhereLesserThanEqual(mandatory.lessThanEqual || mandatory.lte || {});

		// OPTIONAL
		applyOptionals(optional);

		return self;
	};
};
