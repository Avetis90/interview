<template>
  <div>
    <v-btn
      color="primary"
      outline
      block
      large
      :disabled="loading"
      :loading="loading"
      @click.stop="exportData()">
      Export Application Data
      <v-icon right dark>save_alt</v-icon>
    </v-btn>
    <Snackbar :color="snackbarColor" :content="snackbar" :snackbar="snackbar" @dismissed="snackbar = false"></Snackbar>
  </div>
</template>

<script>
export default {
  name: 'ApplicationExportButton',
  props: {
    slug: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      loading: false,
      snackbarColor: 'success',
      snackbar: false
    }
  },
  methods: {
    exportData () {
      this.loading = true
      window.axios.get(process.env.API_URL + 'application/' + this.slug + '/export')
      .then(response => {
        this.snackbarColor = 'success'
        this.snackbar = response.data.export
        console.log(response)
      }).catch(error => {
        this.snackbarColor = 'error'
        this.snackbar = error.message
      }).then(() => {
        this.loading = false
        console.log(this.snackbar)
      })
    }
  }
}
</script>
