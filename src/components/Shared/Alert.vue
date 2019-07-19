<template>
  <v-alert :type="type" dismissible @input="onClose" :value="true">
    <div>{{ text }}</div>
  </v-alert>
</template>

<script>
  export default {
    props: ['text', 'type'],
    methods: {
      onClose () {
        this.$emit('dismissed')
      }
    }
  }
</script>
