<template>
  <v-dialog v-model="show" max-width="600px">

    <v-alert :value="error" type="error">
      {{ errorString }}
    </v-alert>

    <v-card>

      <!-- //Title -->
      <v-card-title>
        <div class="title mb-2 mt-2">Create Application</div>
      </v-card-title>

      <!-- //Content -->
      <v-card-text>
        <v-layout row>
          <v-flex xs12>
            <v-text-field
              name="name"
              label="Name"
              id="name"
              v-model="name"
              required></v-text-field>
          </v-flex>
        </v-layout>
      </v-card-text>

      <!-- //Actions -->
      <v-divider></v-divider>
      <v-card-actions>
        <v-layout row py-2>
          <v-flex xs12 class="text-xs-right">
            <v-btn flat @click.stop="close">Cancel</v-btn>
            <v-btn color="primary" @click.stop="save" :disabled="disabled">Save</v-btn>
          </v-flex>
        </v-layout>
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>

<script>
  export default {
    props: ['visible'],
    data () {
      return {
        name: '',
        error: false,
        errorString: ''
      }
    },
    computed: {
      show: {
        get () {
          return this.visible
        },
        set (value) {
          if (!value) {
            this.$emit('close')
          }
        }
      },
      disabled () {
        return this.name.length === 0
      }
    },
    methods: {
      save () {
        let data = {
          name: this.name
        }
        this.$store.dispatch('createApplication', data)
          .then(response => {
            this.reset()

            // Redirect to the app
            if (response.data.application.slug) {
              const slug = response.data.application.slug
              const url = window.location.origin.split('://')
              const subdomain = url[1].split('.')
              if (subdomain[0] === 'informed365') {
                subdomain.unshift(slug)
              } else {
                subdomain[0] = slug
              }
              window.location.href = url[0] + '://' + subdomain.join('.')
            }
          })
          .catch(
            error => {
              this.errorString = error.response.data.message || error.response.data.name[0]
              this.error = true
            }
          )
      },
      close () {
        this.reset()
      },
      reset () {
        this.name = ''
        this.show = false
        this.error = false
      }
    }
  }
</script>
