exports.resolve = function (cwd, ref) {
  if(ref[0] !== '.') return ref
  var path = cwd.split('/')
  var rel = ref.split('/')
  while(rel.length) {
    var dir = rel.shift()
    if(dir === '..')
      path.pop()
    else if(dir !== '.')
      path.push(dir)
  }
  return path.join('/')
}

