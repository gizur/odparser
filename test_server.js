// Imports
// =======

var http = require('http');
var OdParser = require('./odparser.js');

var Update = require('json2sql').Update;
var Insert = require('json2sql').Insert;

// Setup logging
// =============

var log = console.log.bind(console);
var debug = console.log.bind(console, 'DEBUG');
var info = console.info.bind(console);
var error = console.error.bind(console);

// HTTP server
// ==========

var server = http.Server();

server.on('request', function(req, res) {
  req.on('close', function(){console.log('close in request')});
  res.on('finish', function(){console.log('finish in response')});

  console.log('processing request: ', req.url);
  var ast = new OdParser().parseReq(req);
  res.write(JSON.stringify(ast));
  
  if (ast.queryType === 'insert' && !ast.bucket_op) req.pipe(new Insert(null, ast.schema, ast.table)).pipe(res);
  else if (ast.queryType === 'update') req.pipe(new Update(null, ast.schema, ast.table)).pipe(res);
  else req.pipe(res);
});


// Plumming below ...
// ===================

server.on('clientError', function (exception, socket) {
  log('clientError occured ', exception);
});

server.on('close', function () {
  log('Closing http server');
});

process.on('SIGINT', function () {
  log("Caught interrupt signal");
  server.close();
  setTimeout(process.exit, 1000);
});

process.on('exit', function (code) {
  log('About to exit with code:', code);
});

var port = 3000;
server.listen(port);
log('listening on port', port);
