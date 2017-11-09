#!/usr/bin/env node

'use strict';

var express = require('express');

// Setup Express
var app = express();

app.use('/', function(req, res) {
    res.json({
        message: 'You‘re on Ludwig!'
    });
});

var port = 4000;

// Start server
app.listen(port, function () {
    console.log('Ludwig server is listening on port %d, in %s mode.', port, app.get('env'));
});

module.exports = app;
