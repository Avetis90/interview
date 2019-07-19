<template>
  <v-layout row wrap>
    <v-flex xs12>
      <v-autocomplete
        v-bind:items="questionResponses"
        v-model="editResponseId"
        item-text="response"
        item-value="id"
        :disabled="disabled"
        :multiple="hasValidation"
      ></v-autocomplete>
    </v-flex>
  </v-layout>
</template>

<script>
  import _ from 'lodash'
  import QuestionCompareMixin from '../../Form/QuestionCompareMixin'
  export default {
    name: 'Lookup',
    props: ['question', 'answers', 'responses', 'formId', 'disabled', 'hasValidation'],
    mixins: [QuestionCompareMixin],
    data () {
      return {
        editFormTemplateId: null,
        editQuestionId: null,
        slug: window.location.hostname.split('.')[0]
      }
    },
    computed: {
      editResponseId: {
        get () {
          if (this.hasValidation) {
            return this.responses.map(response => parseInt(response.response))
          } else {
            return this.responses.length ? parseInt(this.responses[0].response) : ''
          }
        },
        set (value) {
          if (this.hasValidation) {
            let oldValue = this.responses.map(response => parseInt(response.response))
            if (value.length < oldValue.length) {
              oldValue.forEach((element) => {
                if (!value.includes(element)) {
                  const deleteResponse = this.responses.find((response) => {
                    return parseInt(response.response) === element
                  })
                  this.$emit('delete-response', deleteResponse.id)
                }
              })
            } else {
              value.forEach((element) => {
                if (!oldValue.includes(element)) {
                  this.$emit('create-response', [null, element])
                }
              })
            }
          } else {
            if (this.responses.length) {
              this.$emit('update-response', [null, value, this.responses[0].id])
            } else {
              this.$emit('create-response', [null, value])
            }
          }
        }
      },
      editQuestion () {
        return this.$store.getters.loadedAllQuestion(this.editFormTemplateId, this.editQuestionId)
      },
      forms () {
        if (!this.editFormTemplateId) {
          return []
        }
        return this.$store.getters.loadedForms(this.editFormTemplateId)
      },
      questionResponses () {
        let responses = []
        _.forEach(this.forms, (form, index) => {
          const formResponses = form.responses.filter(response => response.question_id === this.editQuestionId)
          _.forEach(formResponses, (formResponse, index) => {
            const response = this.questionToResponse(this.editQuestion, [formResponse])
            if (response) {
              responses.push({id: form.id, response: response})
            }
          })
        })
        responses = _.orderBy(responses, 'response')
        return responses
      }
    },
    mounted () {
      if (!this.answers.length) {
        return
      }
      const value = JSON.parse(this.answers[0].answer)
      this.editFormTemplateId = value.formTemplateId
      this.editQuestionId = value.questionId
      this.$store.dispatch('loadFormTemplates', this.slug)
      if (this.editFormTemplateId) {
        this.$store.dispatch('loadSections', this.editFormTemplateId)
        this.$store.dispatch('loadedForms', this.editFormTemplateId)
      }
    }
  }
</script>
