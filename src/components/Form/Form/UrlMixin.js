export default {
  methods: {
    createUrl (url) {
      this.$store.dispatch('setReportURL', url)
    },
    getUrl () {
      const url = this.$route.query.filter
      if (url) {
        this.$store.dispatch('loadReportURL', url)
          .then((response) => {
            this.filters = JSON.parse(response.url)
          })
      } else {
        this.addFilter()
      }
    }
  }
}
