'use strict';
import express from 'express';
import session from 'express-session';
import store from 'connect-mongo';
import passport from 'passport';
import mongoose from 'mongoose';
import path from 'path';
import bodyParser from 'body-parser';

module.exports = (appConfiguration) => {
    const MongoStore = store(session);

    mongoose.connect(appConfiguration.mongo.uri, appConfiguration.mongo.options);
    if (appConfiguration.root && appConfiguration.root.length) {
        const endpoint = appConfiguration.root;
        appConfiguration.root = (endpoint.charAt(endpoint.length-1) === '/') ? endpoint.slice(0, -1) : endpoint;
    } else {
        appConfiguration.root = '';
    }

    process.env.NODE_ENV = process.env.NODE_ENV || 'development';

    const app = express();

    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));
    app.use(express.static(path.join(__dirname, '/dist')));
    app.use(bodyParser.urlencoded({ extended: false }));

    app.use(session({
        secret: appConfiguration.session.secret,
        resave:false,
        saveUninitialized:false,
        store:new MongoStore({mongooseConnection: mongoose.connection})
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    app.use(function(req, res, next) {
        res.header('Access-Control-Allow-Origin', appConfiguration.cors);
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    });

    app.use('/', require('./routers/main')(appConfiguration));

    return app;
}
