// Appication Mixin
import CoreMixin from './CoreMixin.js'
import sortBy from 'lodash/sortBy'

export default {
  mixins: [CoreMixin],
  computed: {
    $_application: function () {
      return this.$store.getters.loadedApplication(this.$_slug)
    },
    $_applicationUrl: function () {
      return 'http' + (process.env.SSL_ENABLED === 'true' ? 's' : '') + '://' + this.$_application.slug + '.' + process.env.APP_DOMAIN
    },
    $_applicationUsers: function () {
      return this.$store.getters.loadedUsers(this.$_slug)
    },
    $_applicationOrganisations: function () {
      return this.$store.getters.loadedOrganisations(this.$_slug)
    },
    $_applicationFormTemplates: function () {
      return this.$store.getters.loadedFormTemplates(this.$_slug)
    },
    $_applicationRoles () {
      return this.$_roles.filter((role) => { return role.name !== 'Super Admin' })
    }
  },
  methods: {
    $_findApplicationUser: function (userId) {
      return this.$_applicationUsers.find(user => {
        return user.id === userId
      })
    },
    $_getApplicationUserRole: function (userId) {
      const user = this.$_findApplicationUser(userId) || this.$_user
      const roleId = user ? user.application_role_id || user.role_id : null
      return roleId ? this.$_findRole(roleId) : null
    },
    $_getApplicationUserRoleName: function (userId) {
      const role = this.$_getApplicationUserRole(userId)
      return role ? role.name : ''
    },
    $_isApplicationAdminUser: function (userId) {
      const roleName = this.$_getApplicationUserRoleName(userId)
      return roleName === 'Super Admin' || roleName === 'Admin'
    },
    $_userIsApplicationAdmin: function () {
      return this.$_isApplicationAdminUser(this.$_user)
    },
    $_getApplicationUserFullName: function (userId) {
      const user = this.$_findApplicationUser(userId)
      return user ? user.first_name + ' ' + user.last_name : null
    },
    $_getApplicationFormTemplates: function () {
      return sortBy(this.$_applicationFormTemplates, element => { return element.name.toLowerCase() })
    },
    $_getApplicationPrivateFormTemplates: function () {
      return this.$_getApplicationFormTemplates().filter(formTemplate => formTemplate.access_level === 'private')
    },
    // Form Template
    $_getFormTemplateQuestions: function (formTemplateId) {
      return this.$store.getters.loadedAllQuestions(formTemplateId)
    }
  },
  created () {
    this.$store.dispatch('loadUsers', this.$_slug)
    this.$store.dispatch('loadOrganisations', this.$_slug)
  }
}
