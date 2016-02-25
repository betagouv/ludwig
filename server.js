'use strict'
var express = require('express'), path = require('path')
var session = require('express-session')
var passport = require('passport')
var ludwigConfig = require('./ludwig-conf')

process.env.NODE_ENV = process.env.NODE_ENV || 'development'

var app = express()

var env = app.get('env')
var config = {
	port: env['NODE_PORT'] || 3000,
	ip: env['NODE_IP'] || 'localhost'
}
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, '/dist')))
app.use(session({
	secret: 'we will need to be able to configure this'
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(function (req, res, next) {
	res.header('Access-Control-Allow-Origin', ludwigConfig.cors['Access-Control-Allow-Origin'])
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
	next()
})

app.use('/', require('./routers/main'))

app.listen(config.port, config.ip, function () {
	console.log('Express server listening on %s:%d, in %s mode', config.ip, config.port, app.get('env'))
	if (ludwigConfig.testFeaturesEnabled) {
		console.info('CAUTION : Test features are enabled. If you are trying to run a production instance, you should probably disable this by setting the testFeaturesEnabled value to false in ludwig-conf.js')
	}
})

exports = module.exports = app
