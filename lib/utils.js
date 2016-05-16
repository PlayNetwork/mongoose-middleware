module.exports = function() {
	'use strict';

	function mergeFilters(base, model) {
		Object.keys(model).forEach(function (key) {
			if (!base[key]) { // base[key] is not present
				base[key] = model[key];
			} else if (Array.isArray(base[key])) { // base[key] is an array
				if (Array.isArray(model[key])) {
					base[key] = base[key].concat(model[key]);
				} else {
					base[key].push(model[key]);
				}
			} else if (Array.isArray(model[key])) {
				model[key].push(base[key]);
				base[key] = model[key];
			} else if (typeof base[key] !== 'object') {
				base[key] = [base[key], model[key]]; // turn into array
			} else { // base[key] is likely JSON
				if (typeof model[key] === 'object') {
					base[key] = mergeFilters(base[key], model[key]);
				}
				// if base[key] is an object, and model[key], ignore
			}
		});

		return base;
	}

	return {
		mergeFilters : mergeFilters
	};
};
