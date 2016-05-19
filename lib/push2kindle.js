/**
 * @author Barret Lee<http://barretlee.com/about/>
 * @license MIT
 */
var Log = new require('log-color');
var nodemailer = require('nodemailer');
var util = require('./util');

var cfg = util.getConfig().push2kindle;
var log = new Log({
  level: 'debug',
  color: true
});

module.exports = function(file) {
  var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: cfg.email,
      pass: cfg.password
    }
  });
  var mailOptions = {
    from: cfg.email,
    to: cfg.kindle,
    subject: 'New post',
    xxx: ''
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      log.error(error);
    } else {
      log.info(info.response);
    }
  });
};