var Memcached = require('memcached'),
    async = require('async'),
    moment = require('moment');
    
if (typeof process.env.MEMCACHE_URL == "undefined") {
  console.log("Requries environment variable MEMCACHE_URL")
  process.exit();
}    

var servers = process.env.MEMCACHE_URL.split(",");
var mc = new Memcached(servers, {reconnect:1000,timeout:1000,retries:5});
var DEFAULT_CACHE_EXPTIME = 60*60*2;

//var url ="https://reader:7reCagUb@reader.cloudant.com:443";

async.series([
  
  function(callback) {
    setTimeout(function() {
     console.log("wait!");
     callback(null,null);
     }, 2000);
   
  },

  function(callback) {
  console.log("Writing keys"); 
    var tasks = [];
    for(var i = 0; i < 100; i++) {
      (function(k,v){
        tasks.push(function(cb) {
          mc.set(k, v, DEFAULT_CACHE_EXPTIME, function(err, data) {
            cb(null,null);
          });
        });
      })(i, i);
    }
    console.log("Tasks",tasks.length);
    async.series(tasks, function(err, data) {
      console.log("keys created")
      callback(null, null);
    })
  },
  
  function(callback) {
    console.log("Fetching keys");
    var tasks = [];
    for(var i = 0; i < 500; i++) {
      (function(k){
        tasks.push(function(callback) {
          var start = moment().valueOf();
          mc.get(k, function(err, data) {
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
