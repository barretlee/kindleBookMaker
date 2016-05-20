var util = require('../lib/util');
var log = util.log;
var load = require('../lib/uri-spider');

load('http://www.barretlee.com/blog/2016/04/28/javascript-performance-tester/', {
  title: '.post-title',
  description: '.post-content',
  reg: function(data){
    return data.replace(/<div class="shit-spider"[\s\S]+?<\/div>/, '');
  }
}).then(function(data){
  console.log(data);
}).catch(function(err){
  log.info(err);
});