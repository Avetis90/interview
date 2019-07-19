<template>
  <v-container>

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
              <form @submit.prevent="onSignin">
                <v-layout row>
                  <v-flex xs12>
                    <div class="headline">{{ headline }}</div>
                  </v-flex>
                </v-layout>
                <v-divider class="my-2"></v-divider>

                <v-layout row>
                  <v-flex xs12>
                    <p>{{ message }}</p>
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
  export default {
    props: ['data'],
    computed: {
      supportText () {
        return 'For support, please contact <a href="mailto:support@informed365.com" target="_blank">Informed 365 Help Desk</a>.'
      },
      applicationImage () {
        return '/static/logo.png'
      },
      headline () {
        return this.data && this.data.headline ? this.data.headline : 'Server Unavailable'
      },
      message () {
        return (this.data && this.data.message ? this.data.message : 'The server is currently unavailable') + '. Please try again later.'
      }
    },
    created: function () {
      const reloadInterval = (this.data && this.data.retry ? this.data.retry : 30) * 1000
      setTimeout(() => { window.location.href = '/' }, reloadInterval)
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
