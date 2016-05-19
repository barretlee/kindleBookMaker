/**
 * @author Barret Lee<http://barretlee.com/about/>
 * @license MIT
 */

var Log = new require('log-color');
var path = require('path');
var fs = require('fs');

var log = new Log({
  level: 'debug',
  color: true
});

module.exports = {
  extract: extract,
  /**
   * get config file
   */
  getConfig: function() {
    var originCfgPath = path.join(__dirname, '../config.simple.js');
    var cfgPath = path.join(__dirname, '../config.js');
    if (!fs.existsSync(cfgPath)) {
      log.warning('Please edit `config.js` in root path. Now using the default config file.');
      var cfg = fs.readFileSync(originCfgPath).toString();
      fs.writeFileSync(cfgPath, cfg);
    }
    return require('../config.js');
  }
}

/**
 * @description Algorithm get article main content
 * @ref
 *   - http://blog.rainy.im/2015/09/02/web-content-and-main-image-extractor/
 *   - https://github.com/SKing7/extractor/blob/master/lib/extract.js
 */
function extract(content, options) {
  var preProcess = function(content) {
      if (typeof content !== 'string') return;
      content = content.replace(/<!--.*?-->/g, '');
      content = content.replace(/<script.*?>[\s\S]*?<\/script>/ig, '');
      content = content.replace(/<style.*?>[\s\S]*?<\/style>/ig, '');
      content = content.replace(/<[\s\S]*?>|[\t\r\f\v]/g, '');
      return content
  };
  var remoteTag = function(str) {
      return content.replace(/<[\s\S]*?>|[\t\r\f\v]/g, '');
  }
  var rmBlank = function(str) {
      return str.replace(/\s+/g, '');
  };
  var initBlocks = function() {
      var viewLines = preProcess(content).split('\n');
      var cleanedContent = preProcess(content).replace(/ /g, '');
      var lines = cleanedContent.split('\n');
      var blockSize = options.blockSize;
      var numOfEmptyLine = 0;
      var tmpLine;
      var tmpWordCount;
      var indexWordsCountTS = [];
      var totalWordCount = 0;
      for (var i = 0; i < lines.length; i++) {
          tmpLine = lines[i];
          tmpWordCount = rmBlank(tmpLine).length;
          if (tmpWordCount === 0) {
              numOfEmptyLine++;
          }
          for (var j = i + 1; j < i + blockSize && j < lines.length; j++) {
              tmpWordCount += rmBlank(lines[j]).length;
          }
          indexWordsCountTS.push(tmpWordCount);
          totalWordCount += tmpWordCount;
      }
      //console.log(lines[64]);
      var threshold = calcThreshold();
      var isStart = false;
      var isEnd = false;
      var endAt;
      var startAt;
      var resultContent = '';
      for (i = 0; i < indexWordsCountTS.length; i++) {
          if (!isStart && indexWordsCountTS[i] > threshold) {
              if (indexWordsCountTS[i + 1] !== 0 ||
                  indexWordsCountTS[i + 2] !== 0 ||
                  indexWordsCountTS[i + 3] !== 0) {
                  isStart = true;
                  startAt = i;
                  continue;
              }
          }
          if (isStart) {
              if (indexWordsCountTS[i] === 0 ||
                  indexWordsCountTS[i + 1] === 0) {
                  isEnd = true;
                  endAt = i;
              }
          }
          if (isEnd) {
              resultContent += viewLines.slice(startAt - 1, endAt).join('\n');
              isStart = isEnd = false;
          }
      }
      console.log(resultContent);

      function calcThreshold() {
          var data_1 = totalWordCount / indexWordsCountTS.length;
          var data_2 = numOfEmptyLine / (lines.length - numOfEmptyLine);
          return middle([100, data_1 << (data_2 >>> 1), 50]);
      }

      function middle(arr) {
          arr = arr.sort(function(a, b) {
              return a > b;
          });
          return arr[arr.length / 2 >>> 0];
      }
  };
  initBlocks();
}