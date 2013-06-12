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

## Overview

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

var options = {
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
	results : [ ... ],
	total : 734
}
```

## API

### Projection (Field Filters)

### Filters

#### Mandatory

#### Optional

#### Keyword

### Sorting

### Pagination

## License


