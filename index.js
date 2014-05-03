
var resolve = require('./util').resolve

function isDelete(obj) {
  return obj.$del === true
}

function isRef (value) {
  return 'object' == typeof value && value && value.$ref && value.$exp
}

function get(obj, path) {
  path = path.split('/')
  console.log('GET', obj, path)
  while(path.length)
    obj = obj[path.shift()]
  return obj
}

function toRef (value) {
  if('string' === typeof value.$ref)
    return function (state) {
      return value.$exp.call(this, get(state, resolve(this.id, value.$ref)))
    }
  else if(Array.isArray(value.$ref))
    return function (state) {
      var id = this.id
      return value.$exp.apply(this, value.$ref.map(function (key) {
        return get(state, resolve(id, key))
      }))
    }
}

function isComplex (value) {
  return 'function' === typeof value || ('object' === typeof value && value.id != null)
}

function isSimple (value) { return !isComplex(value) }

function isFun (value) {
  return 'function' === typeof value
}

module.exports = function () {
  var state = {}
  function get(id) {
    if(!~id.indexOf('/')) return state[id] = state[id] || {}
    var path = id.split('/'), s = state
    while(path.length) {
      var n = path.shift()
      if(!s[n]) s[n] = {}
      s = s[n]
    }
    return s
  }

  function flatten (obj) {
    console.log('STATE', state)
    var _obj = {}
    for(var j in obj)
      if(isSimple(obj[j]))
        _obj[j] = obj[j]

    //then computed properties.
    for(var j in obj)
      if(isComplex(obj[j])) {
        if(isFun(obj[j]))
          _obj[j] = obj[j].call(_obj, state)
        else {
          _obj[j] = flatten(obj[j])
        }
      }

    return _obj
  }

  return {
    append: function (obj) {
      if(!obj.id) throw new Error('object must contain id')
      if(isDelete(obj))
        delete state[obj.id]
      else {
        var s = get(obj.id)
        for(var k in obj)
          s[k] = isRef(obj[k]) ? toRef(obj[k]) : obj[k]
      }
    },
    snapshot: function () {
      var o = {}
      for(var k in state)
        o[k] = flatten(state[k])
      return o
    }
  }
}
