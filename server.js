const express = require('express')
const helmet = require('helmet')
const csp = require('express-csp-header');

const app = express()
const port = process.env.PORT || 8080
const router = express.Router()

const cspMiddleware = csp({
  policies: {
    'block-all-mixed-content': true,
    'frame-ancestors': [csp.NONE]
  }
})

app.use(helmet({
	frameguard: {
		action: 'deny'
	}
}))
app.use(helmet.noCache())

app.use(cspMiddleware)

app.use(express.static(`${__dirname}/dist`))

app.engine('.html', require('ejs').renderFile)

app.set('views', `${__dirname}/dist`)

router.get('/*', (req, res, next) => {
	res.sendFile(`${__dirname}/dist/index.html`)
})

app.use('/', router)

app.listen(port)

console.log('App running on port', port)