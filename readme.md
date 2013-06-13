# Mongoose Middleware

## Features

* Pagination (start, count and total matching)
* Filtering (mandatory matches, optional matches and keyword search)
* Sorting (ascending and descending)
* Projection (response field filtering)

## Install

```Javascript
npm install mongoose-middleware
```

Then, simply require the library where you are using Mongoose to query Mongo as follows:

```Javascript
var
	mongoose = require('mongoose'),
	mongooseMiddleware = require('mongoose-middleware');
```

Optionally configure max documents for pagination:

```Javascript
var
	mongoose = require('mongoose'),
	mongooseMiddleware = require('mongoose-middleware');

	mongooseMiddleware.initialize({
			maxDocs : 1000
		});
```


## Overview

This project aims to make basic searching, sorting, filtering and projection tasks against documents stored in MongoDB trivial via Mongoose middleware. The middle exposes a set of Mongoose Query object chainable methods for ease and simplicity of use.

The following example shows usage of field projections, mandatory and optional search filters, sorting and pagination.

```Javascript
var
	mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	Kitteh = mongoose.model(
		'kittehs',
		new Schema({
			birthday : { type : Date, default : Date.now },
			features : {
				color : String,
				isFurreh : Boolean
			},
			home : String,
			name : String,
			peePatches : [String]
		})
	);

/*
	Retrieve the name, home and features.color of kittehs that live in Seattle,
	that are named "Hamish" and that are brindle, black or white in color. The results
	should be sorted by birthday in descending order and name in ascending order.
*/
var options = {
	filter : {
		field : ['name', 'home', 'features.color'],
		mandatory : {
			contains : {
				home : 'seattle'
			},
			exact : {
				name : 'Hamish'
			}
		},
		optional : {
			contains : {
				'features.color' : ['brindle', 'black', 'white']
			}
		}
	},
	sort : {
		desc : 'birthday',
		asc : 'name'
	},
	start : 0,
	count : 500
};

Kitteh
	.find()
	.field(options)
	.keyword(options)
	.filter(options)
	.order(options)
	.page(options,
		function (err, kittehs) {
			if (!err) {
				console.log('we haz kittehs!');
				console.log(kittehs);
			} else {
				console.log(err);
			}
		});
```

### Results

The options submitted to the `page(options, callback)` middleware method are echoed back in the response along with the results of the query and the total count of results matching the specified filters.

```Javascript
{
	options : {
		count : 500,
		filter : {
			field : ['name', 'home', 'features.color'],
			mandatory : {
				contains : {
					'features.color' : ['brindle', 'black', 'white']
				},
				exact : {
					name : 'Hamish'
				}
			},
			optional : {
				contains : {
					home : 'seattle'
				}
			}
		},
		sort : {
			desc : 'birthday',
			asc : 'name'
		},
		start : 0
	},
	results : [ ... ], // the first 500 brindled, black or white kittehs named Hamish in Seattle
	total : 734
}
```

## API

### Initialization

The maxDocs property may optionally be specified on initialize to ensure no more than the specified number of documents are ever returned from a query. Please note that this does not affect the ability for the component to return the correct total count of results when using the pagination middleware function.

```Javascript
var
	mongoose = require('mongoose'),
	mongooseMiddleware = require('mongoose-middleware');

	mongooseMiddleware.initialize({
			maxDocs : 1000
		});
```

### Projection (Field Filters)

In order specific specific fields from a document in Mongo to be returned, the fields filter may be used.

```Javascript

var options = {
	filters : {
		field : ['firstName', 'lastName', 'qualities.demeanor']
	}
};

MyModel
	.find()
	.field(options)
	.execFind(function (err, results) {
		// work with response...
	});

```

Alternatively, a single field can be specified (not in an array):

```Javascript
MyModel
	.find()
	.field({ filters : { field : '_id' } })
	.execFind(callback);
```

### Filters

Filters can be used in three ways: mandatory, optional and keyword searches. Additionally, for mandatory and optional searches, exact, contains and startsWith string pattern matches may be used.

* `exact` - Matches the string letter for letter, but is not case sensitive
* `contains` - Matches documents where the string exists as a substring of the field (similar to a where field like '%term%' query in a relational datastore)
* `startsWith` - Matches documents where field begins with the string supplied (similar to a where field like 'term%' query in a relational datastore)

#### Mandatory

Mandatory filters require that the document matches the specified search options or they will not be returned.

#### Optional

Optional searches allow you to specify more than one filter that you would like to match results for. This type of search is great for cases where you need to find documents that either match "this" *OR* "that". As an example, image you are searching for cats that are either manx, siamese or tabby, you would configure the filter as follows:

```Javascript
var options = {
	filters : {
		optional : {
			exact : {
				breed : ['manx', 'siamese', 'tabby']
			}
		}
	}
};

KittehModel
	.find()
	.filter(options)
	.execFind(function (err, results) {
		// work with response...
	});
```

#### Keyword

Keyword searches provide a convenient way to search more than one field with a single string. Additionally, keyword filters work differently from mandatory and optional filters in that they do not support `exact`, `contains` or `startsWith`. Instead the matches look for occurrences in a similar way to `contains` but with the ability to specify multiple terms in the query.

The following query will search for documents where the name, description or knownAliases contain Heathcliff the Cat. If the name (or description and knownAliases) contains "Cat, the Heathcliff", "the Cat, Heathcliff", "Heathcliff Cat, the" and "the Heathcliff Cat", those results will also be returned.

```Javascript
var options = {
	filters : {
		keyword : {
			fields : ['name', 'description', 'knownAliases'],
			term : 'Heathcliff the Cat'
		}
	}
};

KittehModel
	.find()
	.filter(options)
	.execFind(function (err, results) {
		// work with response...
	});
```

If you would like to ensure that matches of "Heathcliff the Cat" in that exact format are returned, simply enclose the term in quotes:

```Javascript
var options = {
	filters : {
		keyword : {
			fields : ['name', 'description', 'knownAliases'],
			term : '"Heathcliff the Cat"'
		}
	}
};
```

### Sorting

### Pagination

## License

MIT, see LICENSE.txt
