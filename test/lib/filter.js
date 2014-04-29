describe('filter', function () {

	var
		orClauseItems = [],
		whereClause = {};

	before(function () {
		requireWithCoverage('filter')(mongoose);

		mongoose.Query.prototype.or = function (clause) {
			if (clause) {
				orClauseItems.push(clause);
			}
		};

		mongoose.Query.prototype.where = function (key) {
			return {
				regex : function (value) {
					whereClause[key] = value;
				},
				equals : function (value) {
					whereClause[key] = value;
				}
			}
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
            //orClauseItems[0][0].name.test('cat litter').should.equals(false);
            //orClauseItems[0][0].name.test('the cat').should.equals(false);
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
