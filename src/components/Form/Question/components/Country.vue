<template>
  <div />
</template>

<script>
  import validationMixin from '../QuestionValiationMixin'
  export default {
    name: 'Country',
    mixins: [
      validationMixin
    ],
    props: ['answers'],
    data () {
      return {
        validationTypes: [
          'Dropdown'
        ]
      }
    },
    mounted () {
      this.$root.$on('validation-create', this.eventsAdapter['validation-create'])
      this.$root.$on('validation-remove', this.eventsAdapter['validation-remove'])
    },
    beforeDestroy () {
      this.$root.$off('validation-create', this.eventsAdapter['validation-create'])
      this.$root.$off('validation-remove', this.eventsAdapter['validation-remove'])
    }
  }
</script>
