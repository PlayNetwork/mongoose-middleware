module.exports = function(mongoose) {
	'use strict';

	function sanitize(str) {
		// santizes regex escapes
		return str.replace(/\W\s/ig, '\\$&');
	}

	mongoose.Query.prototype.filter = function (options) {
		if (!options || !options.filters) {
			return this;
		}

		var
			key = null,
			mandatory = options.filters.mandatory || {},
			optional = options.filters.optional || {},
			self = this,
			value = null;

		var applyWhere = function (spec, buildRegex) {
			for (var key in spec) {
				if (spec.hasOwnProperty(key)) {
					var val = buildRegex(spec[key]);

					self.where(key, val);
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
			return (typeof val === 'string' ?
				new RegExp(sanitize(val), 'i') :
				val);
		};

		var regexEndsWith = function (val) {
			return new RegExp(sanitize(val) + '$', 'i');
		};

		var regexStartsWith = function (val) {
			return (typeof val === 'string' ?
				new RegExp('^' + sanitize(val), 'i') :
				val);
		};

		// boolean values should be handled as booleans, not string values
		var regexExact = function (val) {
			if (typeof val === 'string') {
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

		// MANDATORY
		applyWhere(mandatory.contains, regexContains);
		applyWhere(mandatory.endsWith, regexEndsWith);
		applyWhere(mandatory.startsWith, regexStartsWith);
		applyWhere(mandatory.exact, regexExact);

		// OPTIONAL
		applyOptionals(optional);

		return self;
	};
};
