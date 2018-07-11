const mongoose = require('mongoose'),
   bluebird = require('bluebird'),
   config = require('./config');

const env = process.env.NODE_ENV || 'development';

module.exports = function() {
   mongoose.Promise = bluebird;
   mongoose.connect(config[env].dbLink, err => {
      if (err) console.log(err);
      else console.log('Mongoose is connected');
   });
};
