'use strict'
require('dotenv').config()
module.exports = {
  NODE_ENV: '"production"',
  APP_NAME: JSON.stringify(process.env.APP_NAME),
  APP_DOMAIN: JSON.stringify(process.env.APP_DOMAIN),
  SSL_ENABLED: JSON.stringify(process.env.SSL_ENABLED),
  ABR_GUID: JSON.stringify(process.env.ABR_GUID),

  API_URL: JSON.stringify(process.env.API_URL + 'api/'),
  API_ORIGIN_URL: JSON.stringify(process.env.API_URL),
}