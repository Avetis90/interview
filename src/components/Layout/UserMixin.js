export default {
  computed: {
    roles () {
      return this.$store.getters.roles
    },
    userIsAuthenticated () {
      return this.$store.getters.user !== null && this.$store.getters.user !== undefined
    },
    userIsApplicationAdmin () {
      return this.userIsAdmin || this.isSuperUser
    },
    userIsAdmin () {
      if (!this.userIsAuthenticated || !this.application) {
        return false
      }
      return this.getRole(this.application.application_role_id) === 'Admin'
    },
    isSuperUser () {
      if (!this.userIsAuthenticated) {
        return false
      }
      return this.getRole(this.$store.getters.user.role_id) === 'Super Admin'
    }
  },
  methods: {
    getRole (roleId) {
      const role = this.roles.find((role) => {
        return role.id === roleId
      })
      return role ? role.name : 'undefined'
    }
  }
}
