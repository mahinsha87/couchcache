
var nano = null,
    cacheDB = null,
    opts = null,
    async = require('async'),
    zlib = require('zlib'),
    _ = require('underscore'),
    moment = require('moment');

// default values
var defaultOptions = {
  expires: 60*60*24*1000,
  turbo: false,
  autopurge: true,
  dbname: "cache"
};

// initialise the CouchCache library - make DB connection, deal with options
var init = function(url, options, callback) {
  // initialise couchdb library
  nano = require('nano')(url);
  
  // apply default options, if not supplied
  if (_.isUndefined(callback)) {
    callback = options;
    options = defaultOptions;
  } else {
    Object.keys(defaultOptions).map(function(key) {
      options[key] = _.isUndefined(options[key]) ? defaultOptions[key] : options[key];
    });
  }
  opts = options;
  
  // create the database
  nano.db.create(opts.dbname, function (err, body) {
    cacheDB = nano.db.use(opts.dbname);
    createViews(callback);
  });
  
  // if we are to autopurge, run purge every hour
  if (opts.autopurge) {
    setInterval(function() {
      purge(function(err, data) { });
    }, 1000*60*60);
  }
};

// check to see if view "id" has contains "content"; if not replace it
var checkView = function (id, content, callback) {
  var rev = null;

  // fetch the view
  cacheDB.get(id, function (err, data) {

    // if there's no existing data
    if (!data) {
      data = {};
      rev = null;
    } else {
      rev = data._rev;
      delete data._rev;
    }

    // if comparison  of stringified versions are different
    if (JSON.stringify(data) !== JSON.stringify(content)) {
      if (rev) {
        content._rev = rev;
      }

      // update the saved version
      cacheDB.insert(content, function (err, data) {
        callback(null, true);
      });
    } else {
      callback(null, false);
    }

  });
};

// create any required views
var createViews = function (callback) {

  var views = [],
	  i = 0,
	  v = {},
    tasks = [];

  // load the views from file
  views = require("./views.json");

  for (i = 0; i < views.length; i++) {
    v = views[i];
    (function(v){ 
      tasks.push(function(callback) {
        checkView(v._id, v, function (err, data) {
          callback(err, data);
        });
      });
    })(views[i]);
  }
  async.series(tasks, function(err, data) {
    callback(err,data);
  });
};

// set a cache key
var set = function(key, value, callback) {
  var doc = {
    cacheKey: key,
    value: value,
    ts: moment().valueOf() + opts.expires
  };
  cacheDB.insert(doc, callback);
};

// set a compressed cache key/vaue
var zset = function(key, value, callback) {
  if (!_.isString(value)) {
    return callback(true, "Strings only");
  }
  zlib.gzip(value, function(err, buffer) {
    set( key, buffer.toString('base64'), callback);
  }); 
};

// get a cache key
var get = function(key, callback) {
  var options =  { 
                    startkey: [ key, 'z'], 
                    endkey:[key, moment().valueOf()], 
                    limit: 1, 
                    descending: true,
                    r: 1   // read quorum - no need to fetch data from other shards as there is only one revision per doc
                 };
  if (opts.turbo) {
    options.stale = "ok";
  }
  cacheDB.view('fetch', 'by_key',  options, function(err, data) {
    if (err) {
      return callback(err, data);
    }
    if (!_.isUndefined(data.rows) && data.rows.length==1 && _.isObject(data.rows[0])) {
      callback(null, data.rows[0].value);
    } else {
      callback(null, null);
    }
  });
};

// fetch a zipped key
var zget = function(key, callback) {
  get(key, function(err, data) {
    if (!err && _.isString(data)) {
      var b = new Buffer(data, "base64");
  	  zlib.gunzip(b, function(err, buffer) {
  	    if (!err) {
  	      callback(null,buffer.toString());
  	    } else {
  	      callback(null, null);
  	    }
  	  });
    } else {
      callback(null, null);
    }

  });
};

// delete a cache key
var del = function(key, callback) {
  // deletion is equivalent of setting null value
  set(key, null, callback);
};

// remove old cache keys - ones whose expires field < now
var purge = function(callback) {
  var batch_size=100;
  var startkey_docid = null;
  var finished = false;
  var total = 0;

  async.doUntil(
    // do this
    function(callback) {
      // fetch results from view by_month - query() is not defined in this gist
       // startkey_docid allows us to page efficiently
       // stale=ok because we won't be querying new data
       // batch_size + 1 because we need to fetch the first docid of the next page in the result set
       // starkey = beginning of time  ----> endkey = now
       var options = {
         limit: batch_size+1,
         startkey: 0,
         endkey: moment().valueOf(),
         stale: "ok"
       };
       if(startkey_docid) {
         options.startkey_docid = startkey_docid;
       }

       cacheDB.view('fetch', 'by_ts', options, function(err,data) {
       
         if(err || data.rows.length==0) {
           finished=true;
           return callback(null);
         }

         // iterate through all docs except the last one (which will be the start of the next batch)
         var docs = [ ];
         for(var i in data.rows) {
           if (typeof data.rows[i].value != 'undefined') {
             docs.push( { _id: data.rows[i].id,
                          _rev: data.rows[i].value,
                          _deleted: true
                         } );
             total++;               
           }
         }

         // store the start of the next page
         if(data.rows.length <= batch_size) {
           finished = true;
         } else {
           startkey_docid = data.rows[data.rows.length - 1]["id"];
         }

         cacheDB.bulk({docs: docs}, function(err, data) {
           callback();
         });

       });
    },
    // until test
    function() {
      return finished;
    },
    // called on completion
    function (err) {
      return callback(err, total);
    }
  ); 
};

module.exports = {
  init: init,
  get: get,
  set: set,
  del: del,
  zset: zset,
  zget: zget,
  purge: purge
};



