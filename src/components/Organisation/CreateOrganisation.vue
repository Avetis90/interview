<template>
  <v-dialog v-model="show" max-width="600">

    <v-alert :value="error" type="info">
      {{ errorString }}
    </v-alert>

    <v-card>

      <!-- //Title -->
      <v-card-title>
        <div class="title mb-2 mt-2">Create Organisation</div>
      </v-card-title>

      <!-- //Content -->
      <v-card-text>
        <v-layout row>
          <v-flex xs12 d-flex>
            <v-text-field
              name="name"
              label="Name"
              id="name"
              v-model="name"
              required>
            </v-text-field>
          </v-flex>
        </v-layout>
      </v-card-text>

      <!-- //Actions -->
      <v-divider></v-divider>
      <v-card-actions>
        <v-layout row py-2>
          <v-flex xs12 class="text-xs-right">
            <v-btn flat @click.stop="close">Cancel</v-btn>
            <v-btn color="primary" @click.stop="save" :disabled="!validForm">Save</v-btn>
          </v-flex>
        </v-layout>
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>

<script>
  export default {
    props: ['slug', 'visible'],
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
      validForm () {
        return this.name !== ''
      }
    },
    methods: {
      save () {
        if (!this.validForm) {
          return false
        }
        const organisationData = {
          slug: this.slug,
          name: this.name
        }
        this.$store.dispatch('createOrganisation', organisationData)
          .then(response => {
            this.reset()
          })
          .catch(
            error => {
              this.errorString = error.response.data.name[0]
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
