// Helper Mixin
import moment from 'moment'
import get from 'lodash/get'
import { version } from '../../package.json'
const API_URL = process.env.API_URL

export default {
  created: () => {
    if (!this.appVersion) {
      this.appVersion = '•'
      window.axios.get(`${API_URL}version`).then(({data}) => {
        this.appVersion = `${version}•${data.v}`
      })
    }
  },
  computed: {
    $_slug: () => window.location.hostname.split('.')[0],
    $_appName: () => process.env.APP_NAME,
    $_appDomain: () => process.env.APP_DOMAIN,
    $_sslEnabled: () => process.env.SSL_ENABLED === 'true',
    $_protocol () {
      return 'http' + (this.$_sslEnabled ? 's' : '') + '://'
    }
  },
  methods: {
    $_getAppVersion: () => this.appVersion || '•',
    $_getDate: date => moment(date).format('YYYY-MM-DD'),
    $_getDateTime: date => moment(date).format('YYYY-MM-DD h:mm A'),
    $_getTimeSince: date => moment(date).fromNow(),
    $_getFirstChar: string => string.charAt(0).toUpperCase(),
    $_getUserApplicationRole: user => get(user, 'role.label') === 'Super Admin' ? 'Super Admin' : get(user, 'application_role.label', 'User'),
    $_getApplicationUrl (slug) {
      return this.$_protocol + slug + '.' + this.$_appDomain
    }
  }
}
