<template>
  <v-container>

    <!-- // Error Message -->
    <v-layout row align-center justify-center v-if="error">
      <v-flex sm12 lg6 xl4>
        <app-alert @dismissed="clearError" :text="error.message"></app-alert>
      </v-flex>
    </v-layout>

    <!-- //Login Form -->
    <v-layout row align-center justify-center>
      <v-flex sm12 lg6 xl4>
        <v-card>

          <!-- // Application Image -->
          <v-card-text class="application-image-slot pb-1" v-if="applicationImage">
            <v-container pb-1>
              <v-layout row wrap>
                <v-flex xs12 text-xs-center>
                  <img class="application-image" v-bind:src="applicationImage" />
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>

          <v-card-text class="pt-1">
            <v-container pt-1>
              <form @submit.prevent="logIn">
                <v-layout row>
                  <v-flex xs12>
                    <div class="headline">Log in</div>
                  </v-flex>
                </v-layout>
                <v-divider class="my-2"></v-divider>

                <v-layout row>
                  <v-flex xs12>
                    <v-text-field
                      name="email"
                      label="Email"
                      id="email"
                      v-model="email"
                      type="email"
                      required></v-text-field>
                  </v-flex>
                </v-layout>
                <v-layout row>
                  <v-flex xs12>
                    <v-text-field
                      name="password"
                      label="Password"
                      id="password"
                      v-model="password"
                      type="password">
                    </v-text-field>
                  </v-flex>
                </v-layout>

                <PasswordComplexity />

                <v-layout row>
                  <v-flex xs12>
                    <v-btn
                      block
                      class="info"
                      type="submit"
                      :disabled="loading"
                      :loading="loading">
                      Log In
                    </v-btn>
                  </v-flex>
                </v-layout>
                <v-divider class="my-2"></v-divider>

                <v-layout row wrap>
                  <v-flex xs12 sm6 text-xs-center text-sm-left class="mt-2">
                    <span>Don't have an account?</span>
                    <router-link :to="{ path: 'register', query: $route.query}">Register</router-link>
                  </v-flex>
                  <v-flex xs12 sm6 text-xs-center text-sm-right class="mt-2">
                    <router-link to="/password/reset" tag="a">Forgot your password?</router-link>
                  </v-flex>
                </v-layout>
              </form>
            </v-container>
          </v-card-text>

          <!-- // Support Text -->
          <v-card-text class="support-slot" v-if="supportText">
            <v-container>
              <v-layout row wrap text-xs-center>
                <v-flex xs12><span v-html="supportText" /></v-flex>
              </v-layout>
            </v-container>
          </v-card-text>

        </v-card>
      </v-flex>
    </v-layout>

  </v-container>
</template>

<script>
  import * as encodedSearch from '../../util/encodedSearch'
  import { mapGetters } from 'vuex'
  const PasswordComplexity = () => import('./PasswordComplexity')
  export default {
    data () {
      const details = encodedSearch.extractLoginDetails()
      return {
        submitted: false,
        email: details.email,
        password: '',
        supportTextTemplate: 'For support, please contact <a href="mailto:support@informed365.com" target="_blank">Informed 365 Help Desk</a>.'
      }
    },
    components: {
      PasswordComplexity
    },
    computed: {
      ...mapGetters([
        'applicationBySlug',
        'user'
      ]),
      application () {
        return this.applicationBySlug(this.$_slug)
      },
      error () {
        return this.$store.getters.error
      },
      loading () {
        return this.$store.getters.loading
      },
      supportText () {
        return this.application && this.application.support_text ? this.application.support_text : this.supportTextTemplate
      },
      applicationImage () {
        try {
          return JSON.parse(this.application.logo).url
        } catch (error) {
          return '/static/logo.png'
        }
      }
    },
    methods: {
      logIn () {
        this.$store.dispatch('signUserIn', { email: this.email, password: this.password })
          .then(response => {})
          .catch(() => {
            this.submitted = false
          })
      },
      clearError () {
        this.$store.dispatch('clearError')
      },
      authenticate () {
        if (this.user) {
          this.$store.dispatch('loadApplications')
          this.$router.push(this.$route.query.redirect || '/')
        }
      }
    },
    created: function () {
      this.clearError()
      this.authenticate()
    },
    watch: {
      user: {
        immediate: true,
        handler (value) {
          this.authenticate()
        }
      }
    }
  }
</script>

<style>
.support-slot {
  background-color:#f2f2f2;
}
img.application-image {
  max-width:250px;
  max-height:75px;
}
</style>
