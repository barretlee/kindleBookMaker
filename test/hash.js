var crypto = require('crypto');
var hash = crypto.createHash('sha256');

hash.update('http://st.imququ.com/static/uploads/2016/03/ssllabs_test_of_imququ_com.png');
console.log(hash.digest('hex'));