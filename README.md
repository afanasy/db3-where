[![NPM Downloads][downloads-image]][downloads-url]
[![Node.js Version][node-version-image]][node-version-url]
[![Linux Build][travis-image]][travis-url]

### Usage
```js
var where = require('db3-where')
where.query(filter)
//returns corresponding sql `where` clause
where.filter(filter)
//returns compare function, usable for Array.filter
```
#### SQL where
```js
where.query({id: 1, name: 'Adam'})
// returns `id` = 1 and name = 'Adam'
where.query({id: [1, 2, 3]})
// returns `id` in (1, 2, 3)
where.query({id: {'>=': 1, '=<': 2}})
// returns `id` >= 1 and `id` =< 2
```
#### Array.filter
```js
var fruit = [
  {id: 1, name: 'Banana'},
  {id: 2, name: 'Apple'},
  {id: 3, name: 'Apple'}
]
fruit.filter(where.filter(1))
// fruit will be
// [{id: 1, name: 'Banana'}]
fruit.filter(where.filter({id: [1, 2]}))
// fruit will be
// [{id: 1, name: 'Banana'}, {id: 2, name: 'Apple'}]
fruit.filter(where.filter({id: {'>=': 2, '<=': 3}}))
// fruit will be
// [{id: 2, name: 'Apple'}, {id: 3, name: 'Apple'}]
```

### When is this useful?
If you want to use the same filtering rules for js `Array.filter` and SQL `where`.

[downloads-image]: https://img.shields.io/npm/dm/db3-where.svg
[downloads-url]: https://npmjs.org/package/db3-where
[node-version-image]: http://img.shields.io/node/v/db3-where.svg
[node-version-url]: http://nodejs.org/download/
[travis-image]: https://img.shields.io/travis/afanasy/db3-where/master.svg
[travis-url]: https://travis-ci.org/afanasy/db3-where
