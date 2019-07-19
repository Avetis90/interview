<template>
  <v-snackbar
    v-model="show"
    :timeout="3000"
    :color="color || 'success'"
    bottom
    left
  >
    {{ content }}
    <v-btn
      dark
      flat
      @click="onClose"
    >
      Close
    </v-btn>
  </v-snackbar>
</template>

<script>
  export default {
    props: ['snackbar', 'content', 'color'],
    methods: {
      onClose () {
        this.$emit('dismissed')
      }
    },
    computed: {
      show: {
        get () {
          return this.snackbar
        },
        set (value) {
          if (!value) {
            this.$emit('dismissed')
          }
        }
      }
    }
  }
</script>
