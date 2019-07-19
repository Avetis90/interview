<template>
  <v-layout row wrap>
    <v-flex d-flex xs12>
      <v-layout row wrap>
        <v-flex d-flex xs12>
          <h1 class="headline primary--text py-3">Applications</h1>
        </v-flex>
        <v-flex d-flex xs12>
          <p>You have access to the following applications on the Informed 365 platform.</p>
        </v-flex>

        <v-flex d-flex xs12 v-if="applications.length">
          <v-card>
            <v-list one-line>

              <!-- //Application List -->
              <template v-for="(application, index) in sortedApplications">
                <v-list-tile :href="applicationUrl(application)" :key="application.id" avatar>
                  <v-list-tile-avatar tile v-if="getApplicationIcon(application)">
                    <img :src="getApplicationIcon(application)">
                  </v-list-tile-avatar>
                  <v-list-tile-avatar color="primary" v-else>
                    <span class="white--text headline">{{ applicationFirstLetter(application) }}</span>
                  </v-list-tile-avatar>
                  <v-list-tile-content>
                    <v-list-tile-title class="black--text">{{ application.name }}</v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>
                <v-divider v-if="index < applications.length -1"></v-divider>
              </template>

            </v-list>
          </v-card>
        </v-flex>

        <!-- //No Applications -->
        <v-flex xs12 pa-2 v-else>
          <v-alert value="true" type="info">
            It looks like you don't have access to any applications yet. You must be invited into an application.
          </v-alert>
        </v-flex>

      </v-layout>
    </v-flex>

    <!-- //Action Button -->
    <v-tooltip top>
      <v-btn slot="activator" fixed dark bottom right fab router class="error" @click.stop="createApplication = true" v-if="isSuperUser">
        <v-icon>add</v-icon>
      </v-btn>
      <span>Create Application</span>
    </v-tooltip>

    <!-- //Create Application -->
    <CreateApplication :visible="createApplication" @close="createApplication = false"></CreateApplication>
  </v-layout>
</template>

<script>
  const CreateApplication = () => import('./CreateApplication')
  export default {
    data () {
      return {
        createApplication: false,
        app_domain: process.env.APP_DOMAIN,
        ssl_enabled: process.env.SSL_ENABLED
      }
    },
    components: {
      CreateApplication
    },
    computed: {
      applications () {
        return this.$store.getters.loadedApplications
      },
      roles () {
        return this.$store.getters.roles
      },
      user () {
        return this.$store.getters.user
      },
      isSuperUser () {
        return this.user && this.getRole(this.user.role_id) === 'Super Admin'
      },
      appProtocol () {
        return this.ssl_enabled === 'true' ? 'https://' : 'http://'
      },
      sortedApplications () {
        return this.applications.slice().sort(function (a, b) { return (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : ((b.name.toLowerCase() > a.name.toLowerCase()) ? -1 : 0) })
      }
    },
    methods: {
      getApplicationIcon (application = []) {
        try {
          return JSON.parse(application.icon).url
        } catch (error) {
          return false
        }
      },
      applicationFirstLetter (application = []) {
        return application.name && application.name.length > 0 ? application.name.trim().substring(0, 1).toUpperCase() : 'A'
      },
      applicationUrl (application = []) {
        return this.appProtocol + application.slug + '.' + this.app_domain
      },
      getRole (roleId) {
        const role = this.roles.find((role) => {
          return role.id === roleId
        })
        return role ? role.name : 'undefined'
      }
    },
    created () {
      this.$store.dispatch('loadApplications')
    }
  }
</script>
