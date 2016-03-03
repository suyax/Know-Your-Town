var express = require('express');
//var mongoose = require('mongoose');
var app = express();
var path = require('path');
//mongoose.connect('mongodb://localhost/Myapp');

// configure our server with all the middleware and routing
require('./config/middleware.js')(app, express);
//require('./config/routes.js')(app, express);
app.get('/', function(req, res) {
     res.sendFile(path.join(__dirname + '/../public/'));
});
// start listening to requests on port 8000


// export our app for testing and flexibility, required by index.js
module.exports = app;

