/**
 * @author Barret Lee<http://barretlee.com/about/>
 * @license MIT
 */
var Log = new require('log-color');
var nodemailer = require('nodemailer');
var util = require('./util');

var cfg = util.getConfig().push2kindle;
var log = util.log;

module.exports = function(attachments) {
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
    subject: 'Kindle New File',
    attachments: attachments,
    alternatives: attachments
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      log.error(error.code + ': ' + JSON.stringify(error));
    } else {
      log.info('send to kindle successfully: ' + JSON.stringify(info));
    }
  });
};