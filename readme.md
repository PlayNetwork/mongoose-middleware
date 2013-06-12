# Mongoose Middleware

## Features

* Pagination
* Filtering
* Sorting
* Projection

## Install

```Javascript
npm install mongoose-middleware
```

## Use

Applying search filters

```Javascript
var
	mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	Kitteh = mongoose.model(
		'kittehs',
		new Schema({
			birthday : { type : Date, default : Date.now },
			description : {
				color : String,
				isFurreh : Boolean
			},
			name : String
		})
	);

function findKittehs(options, callback) {
	'use strict';

	Kitteh
		.find()
		.field(options)
		.keyword(options)
		.filter(options)
		.order(options)
		.page(options, callback);
}

var opts = {
	filters : {
		field : ['description', 'name']
	}
};

findKittehs(opts, function (err, kittehs) {
	if (!err) {
		console.log('we haz kittehs!');
		console.log(kittehs);
	} else {
		console.log(err);
	}
})
```

