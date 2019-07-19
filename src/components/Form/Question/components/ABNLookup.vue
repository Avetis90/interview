<template>
  <div />
</template>

<script>
  import * as _ from 'lodash'
  export default {
    name: 'abn-lookup',
    props: ['answers'],
    mounted () {
      _.forEach(this.answers, (answer, index) => {
        if (answer.answer !== 'Abn' &&
          answer.answer !== 'BusinessName' &&
          answer.answer !== 'EntityName' &&
          answer.answer !== 'EntityTypeName' &&
          answer.answer !== 'Message'
        ) {
          this.$emit('delete-answer', this.answers[index].id)
        }
      })
      const answerTypes = [
        'Abn',
        'BusinessName',
        'EntityName',
        'EntityTypeName',
        'Message'
      ]
      _.forEach(answerTypes, (answerType, index) => {
        const city = this.answers.filter(answer => answer.answer === answerType)
        if (!city.length) {
          this.$emit('create-answer', [answerType, false])
        }
      })
    }
  }
</script>
