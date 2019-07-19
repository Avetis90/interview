// Core Mixin
import moment from 'moment'
export default {
  computed: {
    $_user: function () {
      return this.$store.getters.user
    },
    $_roles: function () {
      return this.$store.getters.roles
    },
    $_slug: function () {
      return window.location.hostname.split('.')[0]
    }
  },
  methods: {
    $_isSuperUser: function (user) {
      const role = user ? this.$_findRole(user.role_id) : null
      return role && role.name === 'Super Admin'
    },
    $_getUserFullName: function (user) {
      return user && user.first_name ? user.first_name + ' ' + user.last_name : null
    },
    $_getUserFullNameWithEmail: function (user) {
      return user && user.first_name ? user.first_name + ' ' + user.last_name + ' (' + user.email + ')' : null
    },
    $_findRole: function (roleId) {
      return this.$_roles.find((role) => {
        return role.id === roleId
      })
    },
    $_getDate: function (date) {
      return moment(date).format('YYYY-MM-DD')
    },
    $_getDateTime: function (date) {
      return moment(date).format('YYYY-MM-DD h:mm A')
    },
    $_formatDate: function (date) {
      return this.$_getDate(date)
    },
    $_formatDateTime: function (date) {
      return this.$_getDateTime(date)
    }
  },
  created () {
    this.$store.dispatch('loadRoles')
  },
  filters: {
    $_formatDate: function (date) {
      return date ? moment(date).format('YYYY-MM-DD') : null
    },
    $_formatDateTime: function (date) {
      return date ? moment(date).format('YYYY-MM-DD h:mm A') : null
    }
  }
}
