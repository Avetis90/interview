<template>
  <v-snackbar
     v-model="show"
     :timeout="3000"
     color="white"
     bottom
     class="v-snackbar-completed"
  >
    <v-container>
      <v-layout>
        <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
          <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
          <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
        </svg>
      </v-layout>
      <v-layout v-html="content" />
    </v-container>
  </v-snackbar>
</template>

<script>
  export default {
    props: ['snackbar', 'content'],
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
<style>
  .v-snackbar-completed {
    height: 100%;
  }
  .v-snackbar-completed .v-snack__content {
    color: black;
    height: 100%;
  }
</style>