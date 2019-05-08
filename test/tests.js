var couchcache = require('../couchcache.js'),
  should = require('should'),
  assert = require('assert');

  if (typeof process.env.COUCH_URL == "undefined") {
    console.log("Requries environment variable COUCH_URL")
    process.exit();
  }
  
  var demoObject = { a: 1, b:"woof", c:[1,2,34], d: { A: 1, B:2}, e: true};
  var demoString  = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
  
  describe('couchcache', function(){ 

    describe('get_and_set', function() {

      // set up our tests
      before(function(done) {
        
        // initialise couchcache
        couchcache.init(process.env.COUCH_URL, function(err, data) {
          done();
        });
      });
      
      it('should allow a cache value to be saved', function(done) {
        
        couchcache.set("thiskey","thisvalue", function(err, data) {
          assert.equal(err, null);
          data.should.be.an.Object;
          data.should.have.property.ok;
          data.ok.should.be.a.Boolean;
          data.ok.should.be.equal(true);
          data.should.have.property.id;
          data.id.should.be.a.String;
          data.should.have.property.rev;
          data.rev.should.be.a.String;
          done();
        });  
      });
      
      it('should allow a second cache value to be saved', function(done) {
        
        couchcache.set("secondkey","secondvalue", function(err, data) {
          assert.equal(err, null);
          data.should.be.an.Object;
          data.should.have.property.ok;
          data.ok.should.be.a.Boolean;
          data.ok.should.be.equal(true);
          data.should.have.property.id;
          data.id.should.be.a.String;
          data.should.have.property.rev;
          data.rev.should.be.a.String;
          done();
        });  
      });
      
      it('should allow a cache value to be retrieved', function(done) {
        
        couchcache.get("thiskey", function(err, data) {
          assert.equal(err, null);
          data.should.be.an.String;
          data.should.be.equal("thisvalue");
          done();
        });  
      });
      
      it('should allow a second cache value to be retrieved', function(done) {
        
        couchcache.get("secondkey", function(err, data) {
          assert.equal(err, null);
          data.should.be.an.String;
          data.should.be.equal("secondvalue");
          done();
        });  
      });
      
      it('should allow a cache value to be overwritten', function(done) {
        
        couchcache.set("secondkey","anothervalue", function(err, data) {
          assert.equal(err, null);
          data.should.be.an.Object;
          data.should.have.property.ok;
          data.ok.should.be.a.Boolean;
          data.ok.should.be.equal(true);
          data.should.have.property.id;
          data.id.should.be.a.String;
          data.should.have.property.rev;
          data.rev.should.be.a.String;
          done();
        });  
      });
      
      it('should allow the revised value be retrieved', function(done) {
        
        couchcache.get("secondkey", function(err, data) {
          assert.equal(err, null);
          data.should.be.an.String;
          data.should.be.equal("anothervalue");
          done();
        });  
      });
      
      it('should fail to return an non-existant key', function(done) {
        
        couchcache.get("_____", function(err, data) {
          assert.equal(err, null);
          assert.equal(data, null);
          done();
        });  
      });
      
      it('should allow a cache value to be deleted', function(done) {
        
        couchcache.del("secondkey", function(err, data) {
          assert.equal(err, null);
          data.should.be.an.Object;
          data.should.have.property.ok;
          data.ok.should.be.a.Boolean;
          data.ok.should.be.equal(true);
          data.should.have.property.id;
          data.id.should.be.a.String;
          data.should.have.property.rev;
          data.rev.should.be.a.String;
          done();
        });  
      });
      
      it('should fail to return an deleted key', function(done) {
        
        couchcache.get("secondkey", function(err, data) {
          assert.equal(err, null);
          assert.equal(data, null);
          done();
        });  
      });
      
      it('should allow an object value to be written', function(done) {
        
        couchcache.set("objectkey", demoObject, function(err, data) {
          assert.equal(err, null);
          data.should.be.an.Object;
          data.should.have.property.ok;
          data.ok.should.be.a.Boolean;
          data.ok.should.be.equal(true);
          data.should.have.property.id;
          data.id.should.be.a.String;
          data.should.have.property.rev;
          data.rev.should.be.a.String;
          done();
        });  
      });
      
      it('should allow the object value be retrieved', function(done) {
        
        couchcache.get("objectkey", function(err, data) {
          assert.equal(err, null);
          data.should.be.an.Object;
          JSON.stringify(data).should.be.equal(JSON.stringify(demoObject));
          done();
        });  
      });
      
      it('should allow a boolean value to be written', function(done) {
        
        couchcache.set("objectkey", true, function(err, data) {
          assert.equal(err, null);
          data.should.be.an.Object;
          data.should.have.property.ok;
          data.ok.should.be.a.Boolean;
          data.ok.should.be.equal(true);
          data.should.have.property.id;
          data.id.should.be.a.String;
          data.should.have.property.rev;
          data.rev.should.be.a.String;
          done();
        });  
      });
      
      it('should allow the boolean value be retrieved', function(done) {
        
        couchcache.get("objectkey", function(err, data) {
          assert.equal(err, null);
          data.should.be.an.Boolean;
          data.should.be.equal.true;
          done();
        });  
      });
      
      it('should allow an array value to be written', function(done) {
        
        couchcache.set("arraykey", [1,2], function(err, data) {
          assert.equal(err, null);
          data.should.be.an.Object;
          data.should.have.property.ok;
          data.ok.should.be.a.Boolean;
          data.ok.should.be.equal(true);
          data.should.have.property.id;
          data.id.should.be.a.String;
          data.should.have.property.rev;
          data.rev.should.be.a.String;
          done();
        });  
      });
      
      it('should allow the array value be retrieved', function(done) {
        
        couchcache.get("arraykey", function(err, data) {
          assert.equal(err, null);
          data.should.be.an.Array;
          data.length.should.equal(2);
          done();
        });  
      });
      
      it('should allow a compressed value to be written', function(done) {
        
        couchcache.zset("zkey", demoString, function(err, data) {
          assert.equal(err, null);
          data.should.be.an.Object;
          data.should.have.property.ok;
          data.ok.should.be.a.Boolean;
          data.ok.should.be.equal(true);
          data.should.have.property.id;
          data.id.should.be.a.String;
          data.should.have.property.rev;
          data.rev.should.be.a.String;
          done();
        });  
      });
      
      it('should allow a compressed value be retrieved', function(done) {
        
        couchcache.zget("zkey", function(err, data) {
          assert.equal(err, null);
          data.should.be.an.String;
          data.should.be.equal(demoString);
          done();
        });  
      });
      
      it('should not allow a non-string written by zset', function(done) {
        
        couchcache.zset("zkey", demoObject, function(err, data) {
          assert.equal(err, true);
          done();
        });  
      });
      
      it('should allow a non-existant compressed value be retrieved', function(done) {
        
        couchcache.zget("zkeyimaginery", function(err, data) {
          assert.equal(err, null);
          assert.equal(data, null);
          done();
        });  
      });
      
      
    });
  });
