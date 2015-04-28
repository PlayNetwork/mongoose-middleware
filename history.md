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
