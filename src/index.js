import field from './field';
import filter from './filter';
import keyword from './keyword';
import order from './order';
import page from './page';

export default ((self = {}) => {
	self.initialize = function (options, mongoose) {

		if (typeof mongoose === 'undefined') {
			mongoose = options;
			options = null;
		}

		// require all modules
		field(mongoose);
		filter(mongoose);
		keyword(mongoose);
		order(mongoose);
		page(mongoose).initialize(options);
	};

	self.utils = require('./utils');

	return self;
})();