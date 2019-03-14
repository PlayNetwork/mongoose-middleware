/* eslint no-magic-numbers : 0 */
import chai from 'chai';
import filterLib from '../../src/filter';
import mongoose from 'mongoose';

const should = chai.should();

describe('filter', () => {
	let
		Kitteh = mongoose.model('kittehs-filter', new mongoose.Schema({
			birthday : {
				default : Date.now,
				type : Date
			},
			features : {
				color : String,
				isFurreh : Boolean
			},
			home : String,
			isDead: Boolean,
			name : String,
			peePatches : [String]
		})),
		orClause = {},
		whereClause = {};

	before(() => {
		filterLib(mongoose);

		mongoose.Query.prototype.or = (orOptions) => {

			if (Array.isArray(orOptions)) {
				orOptions.forEach((elem) => {
					for (let x in elem) {
						if (elem.hasOwnProperty(x)) {
							if (orClause[x]) {
								let newVal = [orClause[x], elem[x]];
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
				gt : () => {
					throw new Error(
						'mongoose.Query.prototype.or does not support gt');
				},
				gte : () => {
					throw new Error(
						'mongoose.Query.prototype.or does not support gte');
				},
				lt : () => {
					throw new Error(
						'mongoose.Query.prototype.or does not support lt');
				},
				lte : () => {
					throw new Error(
						'mongoose.Query.prototype.or does not support lte');
				},
				ne : () => {
					throw new Error(
						'mongoose.Query.prototype.or does not support ne');
				}
			};
		};

		mongoose.Query.prototype.where = (key, val) => {
			if (typeof val === 'undefined') {
				val = { expr : '', val : null };
			}

			if (whereClause[key]) {
				let newVal = [whereClause[key], val];
				whereClause[key] = newVal;
			} else {
				whereClause[key] = val;
			}

			return {
				exists : (v) => {
					whereClause[key].expr = 'exists';
					whereClause[key].val = v;
				},
				gt : (v) => {
					whereClause[key].expr = 'gt';
					whereClause[key].val = v;
				},
				gte : (v) => {
					whereClause[key].expr = 'gte';
					whereClause[key].val = v;
				},
				lt : (v) => {
					whereClause[key].expr = 'lt';
					whereClause[key].val = v;
				},
				lte : (v) => {
					whereClause[key].expr = 'lte';
					whereClause[key].val = v;
				},
				ne : (v) => {
					whereClause[key].expr = 'ne';
					whereClause[key].val = v;
				}
			};
		};
	});

	beforeEach(() => {
		orClause = {};
		whereClause = {};
	});

	it ('should return a query when created', () => {
		let query = Kitteh
			.find()
			.filter(null);

		(query instanceof mongoose.Query).should.equals(true);
	});

	it ('should apply both mandatory and optional filters when both are supplied', () => {
		let options = {
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

		let query = Kitteh
			.find()
			.filter(options);

		should.exist(query);
		should.exist(whereClause.name);
		should.exist(orClause['features.color']);
	});

	describe('mandatory filters', () => {
		it ('should look for occurrences of a term within a string using contains', () => {
			let options = {
				filters : {
					mandatory : {
						contains : {
							name : 'cat'
						}
					}
				}
			};

			let query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(whereClause.name);
			whereClause.name.test('cat').should.equals(true);
			whereClause.name.test('a cat exists').should.equals(true);
			whereClause.name.test('dog').should.equals(false);
		});

		it ('should look for occurrences of a term at the start of a string using endsWith', () => {
			let options = {
				filters : {
					mandatory : {
						endsWith : {
							name : 'cat'
						}
					}
				}
			};

			let query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(whereClause.name);
			whereClause.name.test('cat').should.equals(true);
			whereClause.name.test('cool cat').should.equals(true);
			whereClause.name.test('this cat is sick').should.equals(false);
		});

		it ('should look for occurrences of a term at the start of a string using startsWith', () => {
			let options = {
				filters : {
					mandatory : {
						startsWith : {
							name : 'cat'
						}
					}
				}
			};

			let query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(whereClause.name);
			whereClause.name.test('cat').should.equals(true);
			whereClause.name.test('cat exists').should.equals(true);
			whereClause.name.test('this cat is sick').should.equals(false);
		});

		it ('should look for occurrences of an exact match of the term when using exact', () => {
			let options = {
				filters : {
					mandatory : {
						exact : {
							name : 'cat'
						}
					}
				}
			};

			let query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(whereClause.name);
			whereClause.name.test('cat').should.equals(true);
			whereClause.name.test('cat litter').should.equals(false);
			whereClause.name.test('the cat').should.equals(false);
		});

		it ('should look for occurrences of an exact match of the object when using exact', () => {
			let options = {
				filters : {
					mandatory : {
						exact : {
							isDead : false
						}
					}
				}
			};

			let query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(whereClause.isDead);
			whereClause.isDead.should.equals(false);
		});

		it ('should look for occurrences of an exact match of a number when using exact', () => {
			let options = {
				filters : {
					mandatory : {
						exact : {
							id : 12345
						}
					}
				}
			};

			let query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(whereClause.id);
			whereClause.id.should.equals(12345);
		});

		it('should look for occurrences where given field exists when using exists', () => {
			let options = {
				filters : {
					mandatory : {
						exists : {
							name : true
						}
					}
				}
			};

			let query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(whereClause.name);
			whereClause.name.val.should.equals(true);
		});


		it ('should properly apply where clause when using greaterThan filter', () => {
			let options = {
				filters : {
					mandatory : {
						greaterThan : {
							birthday : new Date(2014, 12, 1)
						}
					}
				}
			};

			let query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(whereClause.birthday);
			whereClause.birthday.expr.should.equal('gt');
		});

		it ('should properly apply where clause when using gt filter', () => {
			let options = {
				filters : {
					mandatory : {
						gt : {
							birthday : new Date(2014, 12, 1)
						}
					}
				}
			};

			let query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(whereClause.birthday);
			whereClause.birthday.expr.should.equal('gt');
		});

		it ('should properly apply where clause when using greaterThanEqual filter', () => {
			let options = {
				filters : {
					mandatory : {
						greaterThanEqual : {
							birthday : new Date(2014, 12, 1)
						}
					}
				}
			};

			let query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(whereClause.birthday);
			whereClause.birthday.expr.should.equal('gte');
		});

		it ('should properly apply where clause when using gte filter', () => {
			let options = {
				filters : {
					mandatory : {
						gte : {
							birthday : new Date(2014, 12, 1)
						}
					}
				}
			};

			let query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(whereClause.birthday);
			whereClause.birthday.expr.should.equal('gte');
		});

		it ('should properly apply where clause when using lessThan filter', () => {
			let options = {
				filters : {
					mandatory : {
						lessThan : {
							birthday : new Date(2014, 12, 1)
						}
					}
				}
			};

			let query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(whereClause.birthday);
			whereClause.birthday.expr.should.equal('lt');
		});

		it ('should properly apply where clause when using lt filter', () => {
			let options = {
				filters : {
					mandatory : {
						lt : {
							birthday : new Date(2014, 12, 1)
						}
					}
				}
			};

			let query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(whereClause.birthday);
			whereClause.birthday.expr.should.equal('lt');
		});

		it ('should properly apply where clause when using lessThanEqual filter', () => {
			let options = {
				filters : {
					mandatory : {
						lessThanEqual : {
							birthday : new Date(2014, 12, 1)
						}
					}
				}
			};

			let query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(whereClause.birthday);
			whereClause.birthday.expr.should.equal('lte');
		});

		it ('should properly apply where clause when using lte filter', () => {
			let options = {
				filters : {
					mandatory : {
						lte : {
							birthday : new Date(2014, 12, 1)
						}
					}
				}
			};

			let query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(whereClause.birthday);
			whereClause.birthday.expr.should.equal('lte');
		});

		it ('should properly apply where clause when using notEqual filter', () => {
			let options = {
				filters : {
					mandatory : {
						notEqual : {
							name : 'cat'
						}
					}
				}
			};

			let query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(whereClause.name);
			whereClause.name.expr.should.equal('ne');
		});

		it ('should properly apply where clause when using ne filter', () => {
			let options = {
				filters : {
					mandatory : {
						notEqual : {
							name : 'cat'
						}
					}
				}
			};

			let query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(whereClause.name);
			whereClause.name.expr.should.equal('ne');
		});

		it ('should look for multiple occurrences of a match when supplying an array', () => {
			let options = {
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

			let query = Kitteh
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

	describe('optional filters', () => {
		it ('should look for occurrences of a term within a string using contains', () => {
			let options = {
				filters : {
					optional : {
						contains : {
							name : 'cat'
						}
					}
				}
			};

			let query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(orClause.name);
			orClause.name.test('cat').should.equals(true);
			orClause.name.test('a cat exists').should.equals(true);
			orClause.name.test('dog').should.equals(false);
		});

		it ('should look for occurrences of a term at the start of a string using endsWith', () => {
			let options = {
				filters : {
					optional : {
						endsWith : {
							name : 'cat'
						}
					}
				}
			};

			let query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(orClause.name);
			orClause.name.test('cat').should.equals(true);
			orClause.name.test('cool cat').should.equals(true);
			orClause.name.test('this cat is sick').should.equals(false);
		});

		it ('should look for occurrences of a term at the start of a string using startsWith', () => {
			let options = {
				filters : {
					optional : {
						startsWith : {
							name : 'cat'
						}
					}
				}
			};

			let query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(orClause.name);
			orClause.name.test('cat').should.equals(true);
			orClause.name.test('cat exists').should.equals(true);
			orClause.name.test('this cat is sick').should.equals(false);
		});

		it ('should look for occurrences of an exact match of the term when using exact', () => {
			let options = {
				filters : {
					optional : {
						exact : {
							name : 'cat'
						}
					}
				}
			};

			let query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(orClause.name);
			orClause.name.test('cat').should.equals(true);
			orClause.name.test('cat litter').should.equals(false);
			orClause.name.test('the cat').should.equals(false);
		});

		it ('should look for occurrences of an exact match of the object when using exact', () => {
			let options = {
				filters : {
					optional : {
						exact : {
							isDead : true
						}
					}
				}
			};

			let query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(orClause.isDead);
			orClause.isDead.should.equals(true);
		});

		it ('should look for occurrences of an exact match of the object when using exact', () => {
			let options = {
				filters : {
					optional : {
						exact : {
							doubleField : '99.99',
							intField : '0100',
							isAlive : 'true',
							isDead : 'false',
							randomField : 'null'
						}
					}
				}
			};

			let query = Kitteh
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

		it ('should look for multiple occurrences of a match when supplying an array', () => {
			let options = {
				filters : {
					optional : {
						exact : {
							name : ['cat', 'Kitteh']
						}
					}
				}
			};

			let query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(orClause.name);
			orClause.name[0].test('cat').should.equals(true);
			orClause.name[1].test('Kitteh').should.equals(true);
		});
	});
});
