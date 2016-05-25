var os   = require('os');
var fs   = require('fs');
var rimraf = require('rimraf');
var path = require('path');

var type = os.type();
console.log(type);
var entry = 'src/demo';
console.log(path.join(entry, 'toc.*'));