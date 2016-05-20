var moment = require('moment');

module.exports = {
  // entry: './src/demo',
  entry: {
    base: './src/demo',
    list: []
  },
  /*option*/
  output: {
    base: './build',
    format: '[name]-' + moment().format('YYYYMMDD')
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
  push2kindle: {
    email: 'barret.china@gmail.com',
    password: 'your-email-password',
    kindle: 'barretlee.com@kindle.cn'
  }
};
