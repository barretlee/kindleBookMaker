var moment = require('moment');

module.exports = {
  // entry: './src/KF8-Demo',
  entry: {
    base: './src/KF8-Demo',
    list: []
  },
  bookInfo: {
    title: "Barret Lee's Personal Website",
    lang: "zh",
    creator: "Barret Lee",
    copyright: "Barret Lee",
    publisher: "",
    coverImage: 'coverImage.png'
  },
  /*option*/
  output: {
    base: './build',
    format: '[name]-' + moment().format('YYYYMMDD')
  },
  /*option for uri*/
  singlePage: {
    title: 'div.title',
    description: 'div.content',
    reg: function(data) {
      return data.replace(/<div class="shit-spider"[\s\S]+?<\/div>/, '');
    }
  },
  /*option*/
  push2kindle: {
    email: 'barret.china@gmail.com',
    password: 'your-email-password',
    kindle: 'barretlee.com@kindle.cn'
  }
};
