var rssLoader = require('../lib/rss-spider');
// var extract = require('../lib/extract');

// http://www.barretlee.com/rss2.xml
rssLoader('https://imququ.com/rss.html').then(function(data){
  console.log(data[0]);
}).catch(function(err){
  console.log(err);
});