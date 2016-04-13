var
	chai = require('chai'),
	should = chai.should();


describe('filter', function () {
	'use strict';

	var
		filterLib = null,
		mongoose = require('mongoose'),
		orClause = {},
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

		mongoose.Query.prototype.or = function (orOptions) {

			if (Array.isArray(orOptions)) {
				orOptions.forEach(function (elem) {
					for (var x in elem) {
						if (elem.hasOwnProperty(x)) {
							if (orClause[x]) {
								var newVal = [orClause[x], elem[x]];
								orClause[x] = newVal;
							} else {
								orClause[x] = elem[x];
							}
						}
					}
				});
			}

			// it doesn't seem the mquery/mongoose supports subsequent gt,lt,
			// gte,lte,ne filtering for or queries, however prior to v0.2.16 of
			// mongoose-middleware some features were built as though it was
			// supported. this will give us some indication if any code remains
			// that tries to use these filtering options
			return {
				gt : function () {
					throw new Error(
						'mongoose.Query.prototype.or does not support gt');
				},
				gte : function () {
					throw new Error(
						'mongoose.Query.prototype.or does not support gte');
				},
				lt : function () {
					throw new Error(
						'mongoose.Query.prototype.or does not support lt');
				},
				lte : function () {
					throw new Error(
						'mongoose.Query.prototype.or does not support lte');
				},
				ne : function () {
					throw new Error(
						'mongoose.Query.prototype.or does not support ne');
				}
			};
		};

		mongoose.Query.prototype.where = function (key, val) {
			if (typeof val === 'undefined') {
				val = { expr : '', val : null };
			}

			if (whereClause[key]) {
				var newVal = [whereClause[key], val];
				whereClause[key] = newVal;
			} else {
				whereClause[key] = val;
			}

			return {
				exists : function (v) {
					whereClause[key].expr = 'exists';
					whereClause[key].val = v;
				},
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
				},
				ne : function (v) {
					whereClause[key].expr = 'ne';
					whereClause[key].val = v;
				}
			};
		};
	});

	beforeEach(function () {
		orClause = {};
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
		should.exist(orClause['features.color']);
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

		it('should look for occurrences where given field exists when using exists', function () {
			var options = {
				filters : {
					mandatory : {
						exists : {
							name : true
						}
					}
				}
			};

			var query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(whereClause.name);
			whereClause.name.val.should.equals(true);
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

		it ('should properly apply where clause when using notEqual filter', function () {
			var options = {
				filters : {
					mandatory : {
						notEqual : {
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
			whereClause.name.expr.should.equal('ne');
		});

		it ('should properly apply where clause when using ne filter', function () {
			var options = {
				filters : {
					mandatory : {
						notEqual : {
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
			whereClause.name.expr.should.equal('ne');
		});

		it ('should look for multiple occurrences of a match when supplying an array', function () {
			var options = {
				filters : {
					mandatory : {
						endsWith : {
							name : ['dog', 'brown']
						},
						startsWith : {
							breed : ['short', 'manx']
						}
					}
				}
			};

			var query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(whereClause.breed);
			should.exist(whereClause.name);

			whereClause.name[0].test('the dog').should.equals(true);
			whereClause.name[1].test('is brown').should.equals(true);
			whereClause.breed[0].test('shorthair').should.equals(true);
			whereClause.breed[1].test('manx').should.equals(true);
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
			should.exist(orClause.name);
			orClause.name.test('cat').should.equals(true);
			orClause.name.test('a cat exists').should.equals(true);
			orClause.name.test('dog').should.equals(false);
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
			should.exist(orClause.name);
			orClause.name.test('cat').should.equals(true);
			orClause.name.test('cool cat').should.equals(true);
			orClause.name.test('this cat is sick').should.equals(false);
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
			should.exist(orClause.name);
			orClause.name.test('cat').should.equals(true);
			orClause.name.test('cat exists').should.equals(true);
			orClause.name.test('this cat is sick').should.equals(false);
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
			should.exist(orClause.name);
			orClause.name.test('cat').should.equals(true);
			orClause.name.test('cat litter').should.equals(false);
			orClause.name.test('the cat').should.equals(false);
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
			should.exist(orClause.isDead);
			orClause.isDead.should.equals(true);
		});

		it ('should look for occurrences of an exact match of the object when using exact', function () {
			var options = {
				filters : {
					optional : {
						exact : {
							isAlive : 'true',
							isDead : 'false',
							randomField : 'null',
							intField : '0100',
							doubleField : '99.99'
						}
					}
				}
			};

			var query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(orClause.isDead);
			orClause.isAlive.should.equals(true);
			orClause.isDead.should.equals(false);
			should.not.exist(orClause.randomField);
			orClause.intField.should.equals(100);
			orClause.doubleField.should.equals(99.99);
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
			should.exist(orClause.name);
			orClause.name[0].test('cat').should.equals(true);
			orClause.name[1].test('Kitteh').should.equals(true);
		});
	});
});
