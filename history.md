# v0.2.19 / 2016-04-27

* addressed an issue that certain strings were incorrectly parsed as legitimate
numbers and caused filters with EXACT phrases would fail

# v0.2.18 / 2016-04-13

* Adding support for `exists` mandatory filters

# v0.2.17 / 2016-03-07

* fix bug were not supplying `optional` search options would cause an exception

# v0.2.16 / 2016-03-07

* modern versions of mongoose expect the skip and limit parameter to be an int.
* remove ability to specify gt,gte,lt,lte and ne parameters with an optional filter

# v0.2.15 / 2016-03-04

* Fixed issue where there was an incompatibility with mquery module in mongoose
* Updated dependencies

# v0.2.14 / 2016-02-22

* Increasing code coverage of unit tests with minor refactors
* Adding `gulp coveralls` task to end of Travis build
* Adding support for `notEqual` mandatory and optional filters

# v0.2.13 / 2015-11-11

* Adding ability to specify filters as arrays via comma-delim strings

# 0.2.12 / 2014-04-28

* Fixing a bug with the sanitization of values prior to creating a regex match
* Adding build support for Node v0.12

# 0.2.11 / 2015-04-28

* @schiang introduced fix for exact match on boolean values

# 0.2.10 / 2014-12-31

* Moving to gulp for build and testing
* Fixed bug where `exact` matches to number values was not working
* Introduced support for `greaterThan` and `lessThan` mandatory filters

# 0.2.9 / 2014-08-28

* Adding support for `endsWith` optional and mandatory filters

# 0.2.8 / 2014-08-26

* Modifying how Mongoose `#where` method is used in filters to be compliant with Mongoose 3.x

# 0.2.7 / 2014-06-28

* Removing testing on Node v0.8 from Travis CI

# 0.2.6 / 2014-06-27

* Fixing documentation to remove references to `execFind`
* Fixing documentation to appropriately use `filters` in the input options

# 0.2.5 / 2014-04-29

* Further refined support for boolean properties

# 0.2.4 / 2014-04-27

* Fixed defect to enable support for boolean properties

# 0.2.3 / 2014-02-11

* Changed use of private Mongoose query method `execFind` to public method `exec`
* Now compatible with Mongoose 3.7x and above

# 0.2.2 / 2013-06-17

* Fixed issue to allow count to accept a value of `0`

# 0.2.1 / 2013-04-23

* Initial release to public
