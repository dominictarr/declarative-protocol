
function isDelete(obj) {
  return obj.$del === true
}

function isRef (value) {
  return 'object' == typeof value && value && value.$ref && value.$exp
}

function toRef (value) {
  if('string' === typeof value.$ref)
    return function (state) {
      return value.$exp.call(this, state[value.$ref])
    }
  else if(Array.isArray(value.$ref))
    return function (state) {
      return value.$exp.apply(this, value.$ref.map(function (key) {
        return state[key]
      }))
    }
}

function isFun (value) {
  return 'function' === typeof value
}

module.exports = function () {
  var state = {}
  function get(id) {
    if(!~id.indexOf('.')) return state[id]
    var path = id.split('.'), s = state
    while(path.length) {
      var n = path.shift()
      if(!s[n]) s[n] = {}
      s = s[n]
    }
    return s
  }

  return {
    append: function (obj) {
      if(!obj.id) throw new Error('object must contain id')
      if(isDelete(obj))
        delete state[obj.id]
      else {
        var s = state[obj.id] = state[obj.id] || {}
        for(var k in obj) {
          s[k] = (
            isRef(obj[k]) ? toRef(obj[k]) : obj[k]
          )
        }
      }
    },
    snapshot: function () {
      var o = {}
      for(var k in state) {
        var _obj = o[k] = {}
        var obj = state[k]
        console.log(obj)
        //add non-computed properties first
        for(var j in obj)
          if(!isFun(obj[j]))
            _obj[j] = obj[j]
        //then computed properties.
        for(var j in obj)
          if(isFun(obj[j]))
            _obj[j] = obj[j].call(_obj, state)
      }
      return o
    }
  }
}
