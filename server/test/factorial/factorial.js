var ffi = require('ffi')

var libfactorial = ffi.Library('./libfactorial', {
  'factorial': [ 'uint64', [ 'int' ] ]
})

var testso = ffi.Library('./Test', {
  'GiveMeFive': ['int', []],
  'Plus': [ 'int', ['int', 'int'] ]
})
var out  = testso
// if (process.argv.length < 3) {
//   console.log('Arguments: ' + process.argv[0] + ' ' + process.argv[1] + ' <max>')
//   process.exit()
// }

// var output = libfactorial.factorial(parseInt(process.argv[2]))

// console.log('Your output: ' + output)
console.log(out.GiveMeFive())
