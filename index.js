'use strict';
import express from 'express';
import session from 'express-session';
import store from 'connect-mongo';
import passport from 'passport';
import mongoose from 'mongoose';
import path from 'path';

module.exports = (appConfiguration) => {
    const MongoStore = store(session);

    mongoose.connect(appConfiguration.mongo.uri, appConfiguration.mongo.options);

    process.env.NODE_ENV = process.env.NODE_ENV || 'development';

    const app = express();

    app.set('view engine', 'ejs');
    app.use(express.static(path.join(__dirname, '/dist')));

    app.use(session({
        secret: appConfiguration.session.secret,
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({mongooseConnection: mongoose.connection})
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
