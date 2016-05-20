var util = require('../lib/util');
var log = util.log;
var rssLoader = require('../lib/rss-spider');

// http://www.barretlee.com/rss2.xml
rssLoader('https://imququ.com/rss.html').then(function(data){
  console.log({
    title: data[0].title,
    description: data[0].description
  });
}).catch(function(err){
  log.info(err);
});