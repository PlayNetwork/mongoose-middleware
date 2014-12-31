var
	chai = require('chai'),
	should = chai.should();


describe('filter', function () {
	'use strict';

	var
		filterLib = null,
		mongoose = require('mongoose'),
		orClauseItems = [],
		whereClause = {};

	var Kitteh = mongoose.model('kittehs-filter', new mongoose.Schema({
		birthday : { type : Date, default : Date.now },
		features : {
			color : String,
			isFurreh : Boolean
		},
		id : Number,
		isDead: Boolean,
		home : String,
		name : String,
		peePatches : [String]
	}));

	before(function () {
		filterLib = require('../../lib/filter')(mongoose);

		mongoose.Query.prototype.or = function (clause) {
			if (clause) {
				orClauseItems.push(clause);
			}
		};

		mongoose.Query.prototype.where = function (key, val) {
			if (typeof val === 'undefined') {
				val = { expr : '', val : null };
			}

			whereClause[key] = val;

			return {
				gt : function (v) {
					whereClause[key].expr = 'gt';
					whereClause[key].val = v;
				},
				gte : function (v) {
					whereClause[key].expr = 'gte';
					whereClause[key].val = v;
				},
				lt : function (v) {
					whereClause[key].expr = 'lt';
					whereClause[key].val = v;
				},
				lte : function (v) {
					whereClause[key].expr = 'lte';
					whereClause[key].val = v;
				}
			};
		};
	});

	beforeEach(function () {
		orClauseItems = [];
		whereClause = {};
	});

	it ('should return a query when created', function () {
		var query = Kitteh
			.find()
			.filter(null);

		(query instanceof mongoose.Query).should.equals(true);
	});

	it ('should apply both mandatory and optional filters when both are supplied', function () {
		var options = {
			filters : {
				mandatory : {
					contains : {
						name : 'cat'
					}
				},
				optional : {
					exact : {
						'features.color' : 'brindle'
					}
				}
			}
		};

		var query = Kitteh
			.find()
			.filter(options);

		should.exist(query);
		should.exist(whereClause.name);
		orClauseItems.should.have.length(1);
	});

	describe('mandatory filters', function () {
		it ('should look for occurrences of a term within a string using contains', function () {
			var options = {
				filters : {
					mandatory : {
						contains : {
							name : 'cat'
						}
					}
				}
			};

			var query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(whereClause.name);
			whereClause.name.test('cat').should.equals(true);
			whereClause.name.test('a cat exists').should.equals(true);
			whereClause.name.test('dog').should.equals(false);
		});

		it ('should look for occurrences of a term at the start of a string using endsWith', function () {
			var options = {
				filters : {
					mandatory : {
						endsWith : {
							name : 'cat'
						}
					}
				}
			};

			var query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(whereClause.name);
			whereClause.name.test('cat').should.equals(true);
			whereClause.name.test('cool cat').should.equals(true);
			whereClause.name.test('this cat is sick').should.equals(false);
		});

		it ('should look for occurrences of a term at the start of a string using startsWith', function () {
			var options = {
				filters : {
					mandatory : {
						startsWith : {
							name : 'cat'
						}
					}
				}
			};

			var query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(whereClause.name);
			whereClause.name.test('cat').should.equals(true);
			whereClause.name.test('cat exists').should.equals(true);
			whereClause.name.test('this cat is sick').should.equals(false);
		});

		it ('should look for occurrences of an exact match of the term when using exact', function () {
			var options = {
				filters : {
					mandatory : {
						exact : {
							name : 'cat'
						}
					}
				}
			};

			var query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(whereClause.name);
			whereClause.name.test('cat').should.equals(true);
			whereClause.name.test('cat litter').should.equals(false);
			whereClause.name.test('the cat').should.equals(false);
		});

		it ('should look for occurrences of an exact match of the object when using exact', function () {
			var options = {
				filters : {
					mandatory : {
						exact : {
							isDead : false
						}
					}
				}
			};

			var query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(whereClause.isDead);
			whereClause.isDead.should.equals(false);
		});

		it ('should look for occurrences of an exact match of a number when using exact', function () {
			var options = {
				filters : {
					mandatory : {
						exact : {
							id : 12345
						}
					}
				}
			};

			var query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(whereClause.id);
			whereClause.id.should.equals(12345);
		});

		it ('should properly apply where clause when using greaterThan filter', function () {
			var options = {
				filters : {
					mandatory : {
						greaterThan : {
							birthday : new Date(2014, 12, 1)
						}
					}
				}
			};

			var query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(whereClause.birthday);
			whereClause.birthday.expr.should.equal('gt');
		});

		it ('should properly apply where clause when using gt filter', function () {
			var options = {
				filters : {
					mandatory : {
						gt : {
							birthday : new Date(2014, 12, 1)
						}
					}
				}
			};

			var query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(whereClause.birthday);
			whereClause.birthday.expr.should.equal('gt');
		});

		it ('should properly apply where clause when using greaterThanEqual filter', function () {
			var options = {
				filters : {
					mandatory : {
						greaterThanEqual : {
							birthday : new Date(2014, 12, 1)
						}
					}
				}
			};

			var query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(whereClause.birthday);
			whereClause.birthday.expr.should.equal('gte');
		});

		it ('should properly apply where clause when using gte filter', function () {
			var options = {
				filters : {
					mandatory : {
						gte : {
							birthday : new Date(2014, 12, 1)
						}
					}
				}
			};

			var query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(whereClause.birthday);
			whereClause.birthday.expr.should.equal('gte');
		});

		it ('should properly apply where clause when using lessThan filter', function () {
			var options = {
				filters : {
					mandatory : {
						lessThan : {
							birthday : new Date(2014, 12, 1)
						}
					}
				}
			};

			var query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(whereClause.birthday);
			whereClause.birthday.expr.should.equal('lt');
		});

		it ('should properly apply where clause when using lt filter', function () {
			var options = {
				filters : {
					mandatory : {
						lt : {
							birthday : new Date(2014, 12, 1)
						}
					}
				}
			};

			var query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(whereClause.birthday);
			whereClause.birthday.expr.should.equal('lt');
		});

		it ('should properly apply where clause when using lessThanEqual filter', function () {
			var options = {
				filters : {
					mandatory : {
						lessThanEqual : {
							birthday : new Date(2014, 12, 1)
						}
					}
				}
			};

			var query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(whereClause.birthday);
			whereClause.birthday.expr.should.equal('lte');
		});

		it ('should properly apply where clause when using lte filter', function () {
			var options = {
				filters : {
					mandatory : {
						lte : {
							birthday : new Date(2014, 12, 1)
						}
					}
				}
			};

			var query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(whereClause.birthday);
			whereClause.birthday.expr.should.equal('lte');
		});
	});

	describe('optional filters', function () {
		it ('should look for occurrences of a term within a string using contains', function () {
			var options = {
				filters : {
					optional : {
						contains : {
							name : 'cat'
						}
					}
				}
			};

			var query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			orClauseItems.should.have.length(1);
			orClauseItems[0][0].name.test('cat').should.equals(true);
			orClauseItems[0][0].name.test('a cat exists').should.equals(true);
			orClauseItems[0][0].name.test('dog').should.equals(false);
		});

		it ('should look for occurrences of a term at the start of a string using endsWith', function () {
			var options = {
				filters : {
					optional : {
						endsWith : {
							name : 'cat'
						}
					}
				}
			};

			var query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			orClauseItems.should.have.length(1);
			orClauseItems[0][0].name.test('cat').should.equals(true);
			orClauseItems[0][0].name.test('cool cat').should.equals(true);
			orClauseItems[0][0].name.test('this cat is sick').should.equals(false);
		});

		it ('should look for occurrences of a term at the start of a string using startsWith', function () {
			var options = {
				filters : {
					optional : {
						startsWith : {
							name : 'cat'
						}
					}
				}
			};

			var query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			orClauseItems.should.have.length(1);
			orClauseItems[0][0].name.test('cat').should.equals(true);
			orClauseItems[0][0].name.test('cat exists').should.equals(true);
			orClauseItems[0][0].name.test('this cat is sick').should.equals(false);
		});

		it ('should look for occurrences of an exact match of the term when using exact', function () {
			var options = {
				filters : {
					optional : {
						exact : {
							name : 'cat'
						}
					}
				}
			};

			var query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			orClauseItems.should.have.length(1);
			orClauseItems[0][0].name.test('cat').should.equals(true);
			orClauseItems[0][0].name.test('cat litter').should.equals(false);
			orClauseItems[0][0].name.test('the cat').should.equals(false);
		});

		it ('should look for occurrences of an exact match of the object when using exact', function () {
			var options = {
				filters : {
					optional : {
						exact : {
							isDead : true
						}
					}
				}
			};

			var query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			orClauseItems.should.have.length(1);
			orClauseItems[0][0].isDead.should.equals(true);
		});

		it ('should look for multiple occurrences of a match when supplying an array', function () {
			var options = {
				filters : {
					optional : {
						exact : {
							name : ['cat', 'Kitteh']
						}
					}
				}
			};

			var query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			orClauseItems.should.have.length(1);
			orClauseItems[0][0].name.test('cat').should.equals(true);
			orClauseItems[0][1].name.test('Kitteh').should.equals(true);
		});
	});
});
