var couchcache = require('../couchcache.js'),
    async = require('async'),
    moment = require('moment');
    
//var url ="https://reader:7reCagUb@reader.cloudant.com:443";
if (typeof process.env.COUCH_URL == "undefined") {
  console.log("Requries environment variable COUCH_URL")
  process.exit();
}

async.series([
  
  function(callback) {
    couchcache.init(process.env.COUCH_URL, { turbo: true },  function(err, data) {
      callback(null,null);
    });
  },
  
  function(callback) {
    
    var tasks = [];
    for(var i = 0; i < 100; i++) {
      (function(k,v){
        tasks.push(function(callback) {
          couchcache.set(k, v, function(err, data) {
            callback(null,null);
          });
        });
      })(i, i);
    }
    async.parallelLimit(tasks, 5, function(err, data) {
      console.log("keys created")
      callback(null, null);
    })
  },
  
  function(callback) {
    
    var tasks = [];
    for(var i = 0; i < 500; i++) {
      (function(k){
        tasks.push(function(callback) {
          var start = moment().valueOf();
          couchcache.get(k, function(err, data) {
            callback(null, moment().valueOf() - start);
          });
        });
      })(i % 100);
    }
    async.series(tasks, function(err, data) {
      console.log("keys fetched", data);
      var tot = 0.0;
      for(var i in data) {
        tot += data[i];
      }
      tot /= data.length;
      console.log("Average Fetch time", tot, "ms");
      callback(null, null);
    })
  },
  
  
  
  ], function(err, data) {
    console.log("done");
    process.exit();
  });