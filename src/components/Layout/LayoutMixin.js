export default {
  computed: {
    slug () {
      return window.location.hostname.split('.')[0]
    },
    application () {
      return this.$store.getters.loadedApplication(this.slug)
    },
    meta () {
      if (!this.application.metas.length) {
        return null
      }
      return this.application.metas[0]
    }
  },
  methods: {
    metaValue (type) {
      if (!this.meta) {
        return ''
      }

      try {
        return JSON.parse(this.meta.metadata)[type]
      } catch (error) {
        return ''
      }
    },
    createMeta (value) {
      this.$store.dispatch('createMeta', {
        metadata: value,
        metableId: this.application.id,
        metableType: 'applications'
      })
        .then(response => {
          this.$store.dispatch('loadApplication', this.slug)
        })
    },
    updateMeta (value) {
      this.$store.dispatch('updateMeta', {
        id: this.meta.id,
        metadata: value,
        metableId: this.application.id,
        metableType: 'applications'
      })
        .then(response => {
          this.$store.dispatch('loadApplication', this.slug)
        })
    },
    deleteMeta () {
      if (!this.meta) {
        return
      }
      this.$store.dispatch('deleteMeta', {
        id: this.meta.id
      })
        .then(response => {
          this.$store.dispatch('loadApplication', this.slug)
        })
    }
  }
}
