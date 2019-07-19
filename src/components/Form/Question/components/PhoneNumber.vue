<template>
  <div />
</template>
<script>
  export default {
    name: 'PhoneNumber',
    props: ['answers'],
    mounted () {
      if (this.answers.length) {
        this.$emit('delete-answers')
      }
    }
  }
</script>
