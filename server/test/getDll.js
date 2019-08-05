var ffi = require('ffi');
// const path = require('path')
// let ddldir = path.join(__dirname, '/test.dll')
var libm = ffi.Library('libm', {
    'ceil': [ 'double', [ 'double' ] ]
});
console.log(libm.ceil(1.5)); // 2