# Mongoose Middleware

[![Build Status](https://secure.travis-ci.org/PlayNetwork/mongoose-middleware.png?branch=master)](https://travis-ci.org/brozeph/mongoose-middleware.svg?branch=main) [![![Coverage Status](https://coveralls.io/repos/github/brozeph/mongoose-middleware/badge.svg?branch=main)](https://coveralls.io/github/brozeph/mongoose-middleware?branch=main)

## Features

* Pagination (start, count and total matching)
* Filtering (mandatory matches, optional matches and keyword search)
* Sorting (ascending and descending)
* Projection (response field filtering)
* Promise support

## Install

```javascript
npm install @brozeph/mongoose-middleware
```

Then, simply require the library and pass in the instance of the `require('mongoose')` statement to the initialize method as follows:

```javascript
let mongoose = require('mongoose');

require('@brozeph/mongoose-middleware').initialize(mongoose);
```

Optionally configure max documents for pagination:

```javascript
let mongoose = require('mongoose');

require('@brozeph/mongoose-middleware')
  .initialize({
    maxDocs : 1000
  }, mongoose);
```

## Overview

This project aims to make basic searching, sorting, filtering and projection tasks against documents stored in MongoDB trivial via Mongoose middleware. The middle exposes a set of Mongoose Query object chainable methods for ease and simplicity of use.

The following example shows usage of field projections, mandatory and optional search filters, sorting and pagination.

```javascript
const
  mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  KittehModel = mongoose.model(
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

require('@brozeph/mongoose-middleware').initialize(mongoose);

/*
  Retrieve the name, home and features.color of kittehs that live in Seattle,
  that are named "Hamish" and that are brindle, black or white in color and born
  prior to January 1st, 2014. The results should be sorted by birthday in
  descending order and name in ascending order.
*/
let options = {
  filters : {
    field : ['name', 'home', 'features.color'],
    mandatory : {
      contains : {
        home : 'seattle'
      },
      exact : {
        name : 'Hamish'
      },
      lessThan : {
        birthday : new Date(2014, 1, 1)
      }
    },
    optional : {
      contains : {
        'features.color' : ['brindle', 'black', 'white']
      }
    }
  },
  sort : ['-birthday', 'name'],
  start : 0,
  count : 500
};

KittehModel
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

### Promise Support

When using `mongoose-middleware`, the library does not interfere with existing [Mongoose support for Promises](http://mongoosejs.com/docs/promises.html). The [`#page`](#pagination) method will return a native Promise if the `callback` argument is not specified.

```javascript
let options = {
  start : 0,
  count : 500
};

KittehModel
  .find()
  .page(options)
  .then((kittehs) => {
    console.log('we haz kittehs!');
    console.log(kittehs);
  })
  .catch(console.error);
```

### Data

The options submitted to the `page(options, callback)` middleware method are echoed back in the response along with the results of the query and the total count of documents matching the specified filters.

```javascript
{
  options : {
    count : 500,
    filters : {
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
    sort : ['-birthday', 'name'],
    start : 0
  },
  data : [ ... ], // the first 500 brindled, black or white kittehs named Hamish in Seattle
  total : 734
}
```

## API

### Initialization

The maxDocs property may optionally be specified on initialize to ensure no more than the specified number of documents are ever returned from a query. Please note that this does not affect the ability for the component to return the correct total count of results when using the pagination middleware function.

```javascript
let mongoose = require('mongoose');

require('mongoose-middleware').initialize({
  maxDocs : 1000
}, mongoose);
```

### Projection (Field Filters)

In order specify specific fields from a document in Mongo to be returned, the fields filter may be used.

```javascript
let options = {
  filters : {
    field : ['name', 'home', 'qualities.demeanor']
  }
};

KittehModel
  .find()
  .field(options)
  .exec(function (err, data) {
    // work with response...
  });
```

Alternatively, a single field can be specified (not in an array):

```javascript
KittehModel
  .find()
  .field({ filters : { field : '_id' } })
  .exec(callback);
```

### Filters

Filters can be used in three ways: mandatory, optional and keyword searches. Additionally, for mandatory and optional searches, exact, equals, contains and startsWith string pattern matches may be used.

The following filters can be used for *mandatory*, *optional*, and *keyword* searches.

* `exact` - Matches the string letter for letter, but is not case sensitive
* `contains` - Matches documents where the string exists as a substring of the field (similar to a where field like '%term%' query in a relational datastore)
* `startsWith` - Matches documents where field begins with the string supplied (similar to a where field like 'term%' query in a relational datastore)
* `endsWith` - Matches documents where field ends with the string supplied (similar to a where field like '%term' query in a relational datastore)

The following filters can *ONLY* be used for *mandatory* and *keyword* searches.

* `equals` - Matches for string value
* `greaterThan` (or `gt`) - Matches documents where field value is greater than supplied number or Date value in query
* `greaterThanEqual` (or `gte`) - Matches documents where field value is greater than or equal to supplied number or Date value in query
* `in` - Matches from a list / Array of values
* `lessThan` (or `lt`) - Matches documents where field value is less than supplied number or Date value in query
* `lessThanEqual` (or `lte`) - Matches documents where field value is less than or equal to supplied number or Date value in query
* `notEqual` (or `ne`) - Matches documents where field value is not equal to the supplied value
* `notIn` (or `nin`) - Matches documents where field value (as Array) does not contain a matching value

#### Mandatory

Mandatory filters require that the document matches the specified search options or they will not be returned.

#### Optional

Optional searches allow you to specify more than one filter that you would like to match results for. This type of search is great for cases where you need to find documents that either match "this" *OR* "that". As an example, image you are searching for cats that are either manx, siamese or tabby, you would configure the filter as follows:

```javascript
let options = {
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
  .exec(function (err, data) {
    // work with response...
  });
```

#### Keyword

Keyword searches provide a convenient way to search more than one field with a single string. Additionally, keyword filters work differently from mandatory and optional filters in that they do not support `exact`, `contains` or `startsWith`. Instead the matches look for occurrences in a similar way to `contains` but with the ability to specify multiple terms in the query.

The following query will search for documents where the name, description or knownAliases contain Heathcliff the Cat. If the name (or description and knownAliases) contains "Cat, the Heathcliff", "the Cat, Heathcliff", "Heathcliff Cat, the" and "the Heathcliff Cat", those results will also be returned.

```javascript
let options = {
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
  .exec(function (err, data) {
    // work with response...
  });
```

If you would like to ensure that matches of "Heathcliff the Cat" in that exact format are returned, simply enclose the term in quotes:

```javascript
let options = {
  filters : {
    keyword : {
      fields : ['name', 'description', 'knownAliases'],
      term : '"Heathcliff the Cat"'
    }
  }
};
```

### Sorting

Sorting, at this point, is fairly basic. All descending sorts will be applied prior to ascending sorts when specifying multiple sorts of each direction. Supports JSON API specs.

#### Descending

```javascript
let options = {
  sort : ['-name', '-description', '-knownAliases']
};

KittehModel
  .find()
  .order(options)
  .exec(function (err, data) {
    // work with response...
  });
```

You may also specify a single field (not an array) as well as an object for both descending and ascending sorts:

```javascript
let options = {
  sort : '-name'
};
```

```javascript
let options = {
  sort : {
    'name': -1,
    'description': 1
  }
};
```

#### Ascending

```javascript
let options = {
  sort : ['name', 'description', 'knownAliases']
};

KittehModel
  .find()
  .order(options)
  .exec(function (err, data) {
    // work with response...
  });
```

You may also specify ascending and descending sorts together:

```javascript
let options = {
  sort : ['name', '-birthday', '-home']
};
```

### Pagination

Pagination is performed by swapping the `exec()` function of Mongoose with `page()`. Pagination may be specified as follows:

```javascript
let options = {
  start : 0,
  count : 100
};

KittehModel
  .find()
  .page(options, function (err, data) {
    // work with response...
  });
```

Pagination relies on the count of documents in a collection in order to return the total. By default, the Mongoose [`estimatedDocumentCount`](https://mongoosejs.com/docs/api.html#model_Model.estimatedDocumentCount) method for performance, but this can be overidden to use ['countDocuments`](https://mongoosejs.com/docs/api.html#model_Model.countDocuments) instead.

```javascript
const
  mongoose = require('mongoose'),
  KittehModel = require('./models/kitteh');

require('mongoose-middleware').initialize({ estimatedDocumentCount : false }, mongoose);

let options = {
  start : 0,
  count : 100
};

KittehModel
  .find()
  .page(options, function (err, data) {
    // data.total will be the result of countDocuments instead of estimatedDocumentCount
  });
```

When using pagination, maxDocs may specified via the `initialize()` function of the library which will result in no more than that maximum number of documents being returned.

```javascript
const
  mongoose = require('mongoose'),
  KittehModel = require('./models/kitteh');

require('mongoose-middleware').initialize({ maxDocs : 50 }, mongoose);

let options = {
  start : 0,
  count : 100
};

KittehModel
  .find()
  .page(options, function (err, data) {
    // data.options.count === 50
  });
```

*Please note*: While the maxDocs will limit the number of returned documents, it will not affect the total count value of matching documents.

#### Response

Pagination returns the specified start, count and overall total numer of matching documents as a wrapper to the results from Mongo.

```javascript
{
  options : {
    count : 50,
    start : 0
  },
  data : [ ... ],
  total : 734
}
```

## Utility Methods

### mergeFilters

mongoose-middleware provides a helper function if you need to programmatically
add filters to the query. It will intelligently merge structures, and ensure
that elements are turned into Arrays when they need to be.

#### Example

```javascript
let base = {
    filters : {
      mandatory : {
        exact : {
          breed : ['manx', 'siamese', 'tabby'],
          name : 'Ballard'
        }
      }
    }
  },
  model = {
    filters : {
      mandatory : {
        exact : {
          breed : 'calico',
          name : 'Fremont'
        }
      }
    }
  },
  merged = require('mongoose-middleware').mergeFilters(base, model);
```

#### Result

```javascript
{
  filters : {
    mandatory : {
      exact : {
        breed : ['manx', 'siamese', 'tabby', 'calico'],
        name : ['Ballard', 'Fremont']
      }
    }
  }
}
```


## License

MIT Style

```text
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
```
