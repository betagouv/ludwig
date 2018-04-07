#!/usr/bin/env node

'use strict'
var app = require('./app')()
var port = 4000

app.listen(port, () => {
  console.log(`Ludwig server is listening at http://localhost:${port}/, in ${app.get('env')} mode.`)
})
