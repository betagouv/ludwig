#!/usr/bin/env node

'use strict'
var port = 4000

require('./app')().then((app) => {
  app.listen(port, () => {
    console.log(`Ludwig server is listening at http://localhost:${port}/, in ${app.get('env')} mode.`)
  })
}).catch(error => {
  console.log(error)
  console.log(JSON.stringify(error))
})
