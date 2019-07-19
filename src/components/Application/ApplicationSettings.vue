<template>
  <v-layout row wrap>
    <v-flex d-flex xs12>
      <v-layout row wrap>

        <!-- //Title -->
        <v-flex d-flex xs12>
          <h1 class="headline primary--text py-3">Settings</h1>
          <v-spacer></v-spacer>

        </v-flex>
      </v-layout>
    </v-flex>

    <v-flex xs12>
      <v-card>
        <v-card-text>

          <!-- Application Name -->
          <v-layout row wrap>
            <v-flex xs12>
              <v-text-field
              name="name"
              label="Application Name"
              v-model="name"
              required>
              </v-text-field>
            </v-flex>
          </v-layout>

          <!-- //Application Icon -->
          <v-layout row>
            <v-flex xs12>
              <label class="v-label v-label--active theme--light">Application Icon</label>
              <v-layout row>
                <v-flex xs12 mt-2>
                  <FileUpload
                    v-bind:maxFiles="maxFiles"
                    v-bind:maxFilesize="maxFilesize"
                    v-bind:acceptedFiles="acceptedFiles"
                    v-bind:files="icon"
                  ></FileUpload>
                </v-flex>
              </v-layout>
            </v-flex>
          </v-layout>

          <!-- //Application Logo -->
          <v-layout row>
            <v-flex xs12>
              <label class="v-label v-label--active theme--light">Application Logo</label>
              <v-layout row>
              <v-flex xs12 mt-2>
                <FileUpload
                  v-bind:maxFiles="maxFiles"
                  v-bind:maxFilesize="maxFilesize"
                  v-bind:acceptedFiles="acceptedFiles"
                  v-bind:files="logo"
                ></FileUpload>
              </v-flex>
              </v-layout>
            </v-flex>
          </v-layout>

          <!-- //Application Background -->
          <v-layout row>
            <v-flex xs12 mt-2>
              <label class="v-label v-label--active theme--light">Application Background</label>
              <v-layout row>
                <v-flex xs12 mt-2>
                  <FileUpload
                    v-bind:maxFiles="maxFiles"
                    v-bind:maxFilesize="maxFilesize"
                    v-bind:acceptedFiles="acceptedFiles"
                    v-bind:files="images"
                  >
                  </FileUpload>
                </v-flex>
              </v-layout>
            </v-flex>
          </v-layout>

          <!-- //Custom CSS -->
          <v-layout row wrap>
            <v-flex xs12>
              <v-textarea
                name="css"
                label="Custom CSS"
                v-model="css"
              >
              </v-textarea>
            </v-flex>
          </v-layout>

          <!-- //Support Text -->
          <v-layout row wrap>
            <v-flex xs12>
              <v-textarea
                name="support"
                label="Support Text"
                v-model="support_text"
              >
              </v-textarea>
            </v-flex>
          </v-layout>

          <!-- //Default Route -->
          <v-layout row wrap>
            <v-flex xs12>
              <v-autocomplete
                :items="routes"
                item-text="text"
                item-value="value"
                v-model="defaultRoute"
                label="Default landing page"
              >
              </v-autocomplete>
            </v-flex>
          </v-layout>

          <!-- //Join Flag -->
          <v-layout row wrap>
            <v-flex xs12>
              <v-switch
                name="join"
                label="Anyone can register and join the application"
                v-model="join_flag"
              >
              </v-switch>
            </v-flex>
          </v-layout>

        </v-card-text>

        <!-- //Actions -->
        <v-divider></v-divider>
        <v-card-actions>
          <v-layout row py-2 px-2>
            <v-flex xs12>
              <v-btn flat class="primary" @click="saveApplication" :disabled="!valid">Save</v-btn>
            </v-flex>
          </v-layout>
        </v-card-actions>

      </v-card>
    </v-flex>
  </v-layout>

</template>

<script>
  export default {
    data () {
      return {
        name: null,
        css: null,
        support_text: null,
        join_flag: null,
        logo: [],
        icon: [],
        images: [],
        acceptedFiles: 'image/*',
        maxFiles: 1,
        maxFilesize: 5,
        deleteApplication: false,
        slug: window.location.hostname.split('.')[0],
        defaultRoute: null,
        routes: [
          { text: 'Forms', value: '/forms' },
          { text: 'Dashboard', value: '/dashboard' },
          { text: 'Report', value: '/report' },
          { text: 'Users', value: '/users' },
          { text: 'Organisations', value: '/organisations' }
        ]
      }
    },
    computed: {
      roles () {
        return this.$store.getters.roles
      },
      application () {
        return this.$store.getters.loadedApplication(this.slug)
      },
      applicationLogo () {
        let logo = null
        if (this.logo.length) {
          logo = {
            name: this.logo[0].name,
            url: this.logo[0].url,
            size: this.logo[0].size,
            stored_name: this.logo[0].stored_name
          }
        }
        return logo === null ? null : JSON.stringify(logo)
      },
      applicationIcon () {
        let icon = null
        if (this.icon.length) {
          icon = {
            name: this.icon[0].name,
            url: this.icon[0].url,
            size: this.icon[0].size,
            stored_name: this.icon[0].stored_name
          }
        }
        return icon === null ? null : JSON.stringify(icon)
      },
      applicationImage () {
        let image = null
        if (this.images.length) {
          image = {
            name: this.images[0].name,
            url: this.images[0].url,
            size: this.images[0].size,
            stored_name: this.images[0].stored_name
          }
        }
        return image === null ? null : JSON.stringify(image)
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
      },
      loading () {
        return this.$store.getters.loading
      },
      valid () {
        return this.name.length > 0
      }
    },
    methods: {
      getRole (roleId) {
        const role = this.roles.find((role) => {
          return role.id === roleId
        })
        return role ? role.name : 'undefined'
      },
      saveApplication () {
        let application = {
          slug: this.application.slug,
          css: this.css,
          supportText: this.support_text,
          joinFlag: this.join_flag,
          logo: this.applicationLogo,
          background_image: this.applicationImage,
          icon: this.applicationIcon,
          default_route: this.defaultRoute
        }

        if (this.name !== this.application.name) {
          application.name = this.name
        }

        this.$store.dispatch('updateApplication', application)
      }
    },
    created: function () {
      this.name = this.application.name
      this.css = this.application.css
      this.support_text = this.application.support_text
      this.join_flag = this.application.join_flag
      this.icon = this.application.icon !== null ? [JSON.parse(this.application.icon)] : []
      this.logo = this.application.logo !== null ? [JSON.parse(this.application.logo)] : []
      this.images = this.application.background_image !== null ? [JSON.parse(this.application.background_image)] : []
      this.defaultRoute = this.application.default_route !== null ? this.application.default_route : '/forms'
    }
  }
</script>
