<template>
  <v-layout row wrap>
    <v-flex xs12>
      <v-autocomplete
        v-bind:items="computedOptions"
        v-model="selectedOption"
        item-text="answer"
        item-value="id"
        :disabled="disabled"
        :multiple="hasValidation"
      ></v-autocomplete>
    </v-flex>
  </v-layout>
</template>

<script>
  export default {
    name: 'multiple-choice',
    props: ['question', 'answers', 'responses', 'formId', 'disabled', 'hasValidation'],
    computed: {
      computedOptions () {
        return this.answers
      },
      selectedOption: {
        get () {
          if (this.hasValidation) {
            return this.responses.map(response => response.answer_id)
          } else {
            return this.responses.length ? this.responses[0].answer_id : ''
          }
        },
        set (newValue) {
          if (this.hasValidation) {
            let oldValue = this.responses.map(response => response.answer_id)
            if (newValue.length < oldValue.length) {
              oldValue.forEach((element) => {
                if (!newValue.includes(element)) {
                  const deleteResponse = this.responses.find((response) => {
                    return response.answer_id === element
                  })
                  this.$emit('delete-response', deleteResponse.id)
                }
              })
            } else {
              newValue.forEach((element) => {
                if (!oldValue.includes(element)) {
                  this.$emit('create-response', [element, null])
                }
              })
            }
          } else {
            if (this.responses.length) {
              this.$emit('update-response', [newValue, null, this.responses[0].id])
            } else {
              this.$emit('create-response', [newValue, null])
            }
          }
        }
      }
    }
  }
</script>
