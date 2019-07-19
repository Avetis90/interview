<template>
  <v-layout row>
    <v-flex xs12>
      <v-autocomplete
        v-model="item"
        :loading="loading"
        :items="items"
        :search-input.sync="search"
        item-text="description"
        hide-no-data
        hide-details
        prepend-icon="place"
        placeholder="Search for an address..."
        no-filter
      >
      </v-autocomplete>
    </v-flex>
  </v-layout>
</template>

<script>
  export default {
    name: 'Address',
    props: ['question', 'answers', 'responses', 'disabled', 'formTemplateId', 'sectionId', 'questionId'],
    data () {
      return {
        loading: false,
        search: null,
        items: [],
        sessionToken: null
      }
    },
    computed: {
      item: {
        get () {
          return this.responses.length ? this.responses[0].response : null
        },
        set (val) {
          this.responses.length ? this.$emit('update-response', [null, val, this.responses[0].id]) : this.$emit('create-response', [null, val])
        }
      }
    },
    methods: {
      getPredictions (val) {
        this.loading = true
        setTimeout(() => {
          this.items = []

          if (val && val.length) {
            let query = {
              input: val,
              sessionToken: this.sessionToken
            }
            let service = new google.maps.places.AutocompleteService()
            service.getQueryPredictions(query, (predictions, status) => {
              this.items = predictions ? predictions.map(prediction => prediction.description) : []
            })
          }
          this.loading = false
        }, 500)
      }
    },
    watch: {
      search (val) {
        if (val !== this.item) {
          this.getPredictions(val)
        }
      }
    },
    mounted () {
      this.items = this.item ? [this.item] : []
      this.sessionToken = new google.maps.places.AutocompleteSessionToken()
    }
  }
</script>
