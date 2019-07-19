<template>
  <v-dialog v-model="show" max-width="600">

    <v-alert :value="error" type="error">
      {{ errorString }}
    </v-alert>

    <v-card>

      <!-- //Title -->
      <v-card-title>
        <div class="title mb-2 mt-2">Create Form Template</div>
      </v-card-title>

      <!-- //Content -->
      <v-card-text>
        <v-layout row wrap>
          <v-flex xs12>
            <v-text-field
              name="name"
              label="Name"
              id="name"
              v-model="name"
              required>
            </v-text-field>
          </v-flex>
        </v-layout>

        <!-- //Types -->
        <v-flex xs12 v-if="types.length">
          <v-autocomplete
                  :items="types"
                  item-value="id"
                  item-text="type"
                  v-model="typeId"
                  label="Audience"
          ></v-autocomplete>
        </v-flex>
      </v-card-text>

      <!-- //Actions -->
      <v-divider></v-divider>
      <v-card-actions>
        <v-layout row py-2>
          <v-flex xs12 class="text-xs-right">
            <v-btn flat @click.stop="close">Cancel</v-btn>
            <v-btn class="primary" @click.stop="save" :disabled="!formTemplateIsValid">Save</v-btn>
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
        errorString: '',
        typeId: null
      }
    },
    watch: {
      types (value) {
        const type = value.find(type => type.name === 'organisation')
        if (type) {
          this.typeId = type.id
        }
      }
    },
    mounted () {
      const type = this.types.find(type => type.name === 'organisation')
      if (type) {
        this.typeId = type.id
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
      types () {
        let types = this.$store.getters.types
        types.forEach((type) => {
          type.type = type.name === 'application' ? 'User' : 'Organisation'
        })
        return types
      },
      formTemplateIsValid () {
        return this.name !== ''
      }
    },
    methods: {
      save () {
        if (!this.formTemplateIsValid) {
          return
        }

        const formTemplateData = {
          slug: this.slug,
          name: this.name,
          typeId: this.typeId
        }
        this.$store.dispatch('createFormTemplate', formTemplateData)
          .then(response => {
            this.close()

            // Redirect to the formTemplate Templates
            if (response.data.form_template.id) {
              this.$router.push('/form-templates/' + response.data.form_template.id)
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
        this.name = ''
        const type = this.types.find(type => type.name === 'organisation')
        if (type) {
          this.typeId = type.id
        }
        this.show = false
      }
    }
  }
</script>
