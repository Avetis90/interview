<template>
  <v-container>
    <v-layout row align-center justify-center v-if="message">
      <v-flex sm12 lg6 xl4>
        <app-alert @dismissed="onDismissed" :text="message" type="success"></app-alert>
      </v-flex>
    </v-layout>
    <v-layout row align-center justify-center v-if="error">
      <v-flex sm12 lg6 xl4>
        <app-alert @dismissed="onDismissed" :text="error.message"></app-alert>
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
                  <div class="headline">Reset my password</div>
                </v-flex>
              </v-layout>
              <v-divider class="my-2"></v-divider>

              <v-layout row>
                <v-flex xs12>
                  <p>Enter your email address and we will email you link to reset your password.</p>
                </v-flex>
              </v-layout>

              <form @submit.prevent="onResetPassword">
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
                    <v-btn
                      block
                      color="info"
                      type="submit"
                      :disabled="loading"
                      :loading="loading">
                      Reset my password
                    </v-btn>
                  </v-flex>
                </v-layout>
              </form>

              <v-divider class="my-2"></v-divider>

              <v-layout row>
                <v-flex xs12 text-xs-left class="mt-4">
                  <span>I'm ready to </span>
                  <router-link :to="{ path: '/login', query: $route.query}">Log In</router-link>
                </v-flex>
              </v-layout>
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
  export default {
    data () {
      return {
        email: '',
        message: ''
      }
    },
    computed: {
      slug () {
        return window.location.hostname.split('.')[0]
      },
      user () {
        return this.$store.getters.user
      },
      loading () {
        return this.$store.getters.loading
      },
      error () {
        return this.$store.getters.error
      },
      supportText () {
        if (this.application && this.application.support_text) {
          return this.application.support_text
        }
        return 'For support, please contact <a href="mailto:support@informed365.com" target="_blank">Informed 365 Help Desk</a>.'
      },
      application () {
        return this.$store.getters.loadedApplication(this.slug)
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
      onValidate (value) {
        if (value !== null && value !== undefined) {
          this.$router.push('/')
        }
      },
      onResetPassword () {
        this.message = ''
        this.$store.dispatch('resetPassword', {email: this.email})
          .then(response => {
            this.message = response.data.user
          })
      },
      onDismissed () {
        this.$store.dispatch('clearError')
      }
    },
    created: function () {
      this.onDismissed()
      this.onValidate(this.user)
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
