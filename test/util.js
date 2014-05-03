var resolve = require('../util').resolve

var tape = require('tape')

var examples = [
  ['foo', './bar', 'foo/bar'],
  ['foo/bar', '../baz', 'foo/baz']
]

examples.forEach(function (e) {
  tape('resolve(' + e[0] + ', ' + e[1] + ') => ' + e[2], function (t) {
    t.equal(resolve(e[0], e[1]), e[2])
    t.end()
  })
})
