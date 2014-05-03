
var tape = require('tape')
var protocol = require('../')

/*
the idea is a visual protocol that can only
be appended to, but you can edit everything
only using appends. This will make it possible
to have interactive, secure, animations

and will run on top of web technology,
but be simple enough to implement natively.

the first phase should just be figuring out
the JSON syntax for sending changes,
these will utlimately refer to shapes, etc,
but for now, can just do arbitary datatypes...

it would be a good idea to not use anything
that could not be represented in a binary version
of the protocol, later.

The protocol will mainly be about laying out boxes.

Rectangle Designer
Rectangle-protocol??


*/

tape('simple', function (t) {
  var p = protocol()
  p.append({id: 'foo', bar: true})
  t.deepEqual(p.snapshot(), {foo: {id: 'foo', bar: true}})
  t.end()
})

tape('delete', function (t) {
  var p = protocol()
  p.append({id: 'foo', $del: true})
  t.deepEqual(p.snapshot(), {})
  t.end()
})

//take a value from another object.
tape('reference', function (t) {

  var p = protocol()
  p.append({id: 'foo', value: 1})
  //TODO, limit to numerical expressions...
  //maybe even go so far as to make an interpreter for these.
  p.append({id: 'bar', value: {
    $ref: 'foo', $exp: function ($1) {
      return $1.value + 3
    }}
  })

  t.deepEqual(p.snapshot(), {
    foo: {id: 'foo', value: 1},
    bar: {id: 'bar', value: 4}
  })
  t.end()
})

function centered (ref) {
  return {$ref: ref, $exp: function (ref) {
    return {
      x: ref.position.x + (ref.size.x - this.size.x) / 2,
      y: ref.position.y + (ref.size.y - this.size.y) / 2
    }
  }}
}

tape('self-reference', function (t) {

  var p = protocol()

  //should I represent the position of something by it's center?
  //or by it's corner? or should I be able to support each of these?
  //do center: x,y; dimensions: w,h; topleft: x,y
  // these could just be translated into expressions about the topleft?
  //for say, circles, it's way nicer to position from center + radius.
  p.append({id: 'foo', position: {x: 0, y: 0}, size: {x: 20, y: 10}})
  //bar is centered inside foo
  p.append({id: 'bar', position: centered('foo'), size: {x: 10, y: 5}})

  t.deepEqual(p.snapshot().bar, {
    id: 'bar', position: {x: 5, y: 2.5}, size: {x: 10, y: 5}
  })
  t.end()
})

tape('multi-reference', function (t) {

  var p = protocol()

  p.append({id: 'foo', position: {x: 0, y: 0}, size: {x: 20, y: 10}})
  p.append({id: 'bar', position: {x: 10, y: 10}, size: {x: 20, y: 10}})

  function between (a, b) {
    return {$ref: [a, b], $exp: function (a, b) {
      return {
        x: a.position.x + b.position.x / 2,
        y: a.position.y + b.position.y / 2
      }
    }}
  }

  p.append({id: 'baz', position: between('foo', 'bar'), size: {x: 10, y: 5}})

  t.deepEqual(p.snapshot().baz, {
    id: 'baz', position: {x: 5, y: 5}, size: {x: 10, y: 5}
  })

  t.end()
})

tape('nesting', function (t) {
  var p = protocol()

  p.append({ id: 'foo', position: {x:0, y:0}, size: {x:100, y:100} })
  p.append({ id: 'foo/bar', position: centered('..'), size: {x: 50, y: 50} })

  t.deepEqual(p.snapshot(), {
      foo: {
      id: 'foo',
      position: {x: 0, y: 0},
      size: {x: 100, y: 100},
      //should this be a sub property?
      //or should it just be like the other attributes.
      //if it's an attribute, then you have to check
      //whether it's a child or not.
      //I'm gonna go with NO. simpler.
      bar:{
        id: 'foo/bar',
        position: {x: 25, y: 25},
        size: {x: 50, y: 50}
      }
    }
  })

  t.end()
})

