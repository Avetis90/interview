<template>
  <v-container>
    <v-layout row align-center justify-center v-if="error">
      <v-flex sm12 lg6 xl4>
        <app-alert @dismissed="clearError" :text="error.message"></app-alert>
      </v-flex>
    </v-layout>
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
            <v-container>
              <v-layout row>
                <v-flex xs12>
                  <div class="headline">Create an account</div>
                </v-flex>
              </v-layout>
              <v-divider class="my-2"></v-divider>

              <form @submit.prevent="onSignup">
                <v-layout row>
                  <v-flex xs12>
                    <v-text-field
                      name="firstname"
                      label="Firstname"
                      id="firstname"
                      v-model="firstname"
                      type="text"
                      required></v-text-field>
                  </v-flex>
                </v-layout>
                <v-layout row>
                  <v-flex xs12>
                    <v-text-field
                      name="lastname"
                      label="Lastname"
                      id="lastname"
                      v-model="lastname"
                      type="text"
                      required></v-text-field>
                  </v-flex>
                </v-layout>
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
                      type="password"
                      :rules="[validation]"
                      ></v-text-field>
                  </v-flex>
                </v-layout>
                 <v-layout row style="display:none !important;">
                  <v-flex xs12>
                    <v-text-field
                      name="otherNameInformed365"
                      id="otherNameInformed365"
                      v-model="otherName"
                      type="text"
                      autocomplete="false"
                    ></v-text-field>
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
                      Register
                    </v-btn>
                  </v-flex>
                </v-layout>
                
                <v-divider class="my-2"></v-divider>

                <v-layout row>
                  <v-flex xs12 text-xs-center class="mt-2">
                    <span>By creating an account you agree to the </span>
                    <a href="#" @click.stop="terms = true">Terms of Use</a>.
                  </v-flex>
                </v-layout>

                <v-layout row>
                  <v-flex xs12 text-xs-center class="mt-2">
                    <span>Already have an account?</span>
                    <router-link :to="{ path: 'login', query: $route.query}">Log In</router-link>
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

    <!-- // Terms of Use -->
    <Terms :visible="terms" @close="terms = false"></Terms>
  </v-container>
</template>

<script>
  import PasswordMixin from './PasswordMixin.js'
  import * as encodedSearch from '../../util/encodedSearch'
  import { mapGetters } from 'vuex'
  const PasswordComplexity = () => import('./PasswordComplexity')
  export default {
    mixins: [PasswordMixin],
    data () {
      const details = encodedSearch.extractRegistrationDetails()
      return {
        submitted: false,
        firstname: details.firstname,
        lastname: details.lastname,
        email: details.email,
        password: '',
        terms: false,
        otherName: '', // Honey Pot
        created_at: null,
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
        const now = Date.now()
        if (this.submitted && (this.otherName !== '' || now - this.created_at < 1000)) {
          return {
            message: 'There has been an error in registering your account.'
          }
        }
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
      onSignup () {
        const now = Date.now()
        if (this.otherName !== '' || now - this.created_at < 1000) {
          this.submitted = true
          return
        }
        this.$store.dispatch('signUserUp', {
          first_name: this.firstname,
          last_name: this.lastname,
          email: this.email,
          password: this.password
        })
          .then(response => {
          })
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
      this.otherName = ''
      this.created_at = Date.now()
    },
    watch: {
      user: {
        immediate: true,
        handler () {
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
