var util = require('../lib/util');
var push2kindle = require('../lib/push2kindle');
var cfg = util.getConfig();
var path = require('path');
var fs = require('fs');
var log = util.log;
var moment = require('moment');

var title = cfg.output.format + '.mobi';
title = title.replace('[name]', cfg.bookInfo.title);
var build = path.join(__dirname, '../', cfg.output.base, title);


if(fs.existsSync(build)) {
  log.info('sending...');
  push2kindle([
    {
      filename: title.replace('.mobi', moment().format('YYYY-MM-DD-HH-mm-ss') + '.mobi'),
      contentType: 'application/x-mobipocket-ebook',
      content: fs.createReadStream(build)
    }
  ]);
} else {
  log.info(build + ' is not exist.');
}