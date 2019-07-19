<template>
  <v-layout row wrap>
    <v-flex d-flex sm12 md10 offset-md1 xl8 offset-xl2>
      <v-layout row wrap>
        <v-flex d-flex xs12>
          <h1 class="headline primary--text py-3">Accepting Invitation</h1>
        </v-flex>
        <v-flex d-flex xs12>
          <v-alert :value="true" :type="alert">
            {{ message }}
          </v-alert>
        </v-flex>
      </v-layout>
    </v-flex>

  </v-layout>
</template>

<script>
  export default {
    props: ['type', 'token'],
    data () {
      return {
        alert: 'info',
        message: 'You must be signed in to accept this invitation.'
      }
    },
    computed: {
      user () {
        return this.$store.getters.user
      }
    },
    created: function () {
      this.message = 'Processing invitation'
      if (this.token.trim() !== '' && this.user !== null && this.user !== undefined) {
        this.$store.dispatch('acceptInvitation', {type: this.type, token: this.token})
        .then(response => {
          this.message = response.data.data.message ? response.data.data.message : 'Invitation accepted.'
          this.alert = 'success'
          if (this.type === 'application') {
            this.$router.push('/' + response.data.data.slug)
          } else {
            this.$router.push('/' + response.data.slug + '/organisations/' + response.data.data.id)
          }
        })
        .catch(error => {
          this.message = error.response.data.message ? error.response.data.message : 'Error.'
          this.alert = 'error'
        })
      }
    }
  }
</script>
