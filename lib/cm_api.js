var util = require('util');

var request = require('superagent');
var API = require('./api');

/**
 * config = {url, log}
 */
var CMAPI = function(config){
  API.call(this, config);

  this.ghh = config.ghh;
}
util.inherits(CMAPI, API);

/**
 * Sets or updates the build status by build id and context
 */
CMAPI.prototype.setBuildStatus = function(build, context, status, cb){
  status.target_url = "http://proviso.ci/builds/" + build.id;
  status.context = context;

  var ghh_url = util.format("http://%s:%s/update", this.ghh.options.hostname, this.ghh.options.port);

  this.log.debug({update: status}, "Setting build status update to", ghh_url);
  var log = this.log;

  request.post(ghh_url).send({
    update: status,
    build: build
  }).end(function(err){
    if(err){
      log.error({err: err}, "Build update failed");
    }
    cb && cb(err);
  });
}

/**
 * Returns a static project object based on paramters in request.
 */
CMAPI.prototype.findProjectByRepo = function(request, cb){
  this.log.info("returning static project object");

  var self = this;
  setImmediate(function(){
    cb(null, {
      // do we need these for the OS version?
      // service: request.service,
      // host: request.host,

      owner: request.owner,
      repo: request.repo,
      slug: request.slug,
      service_auth: {token: self.ghh.options.githubAPIToken, type: 'token'}
    });
  });
}

// /**
//  * In testing, just return the build
//  */
// CMAPI.prototype.submitBuild = function(build, project, cb){
//   build.id = "a-generated-build-id";
//   build.request = {omitted: true}
//   build.project = project;
//   setImmediate(function(){
//     cb(null, build);
//   });
// }


module.exports = CMAPI;