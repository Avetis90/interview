import * as _ from 'lodash'
import TriggerMixin from './TriggerMixin.js'
import QuestionCompareMixin from './Form/QuestionCompareMixin'
export default {
  mixins: [TriggerMixin, QuestionCompareMixin],
  computed: {
    sections () {
      return this.$store.getters.loadedSections(this.formTemplateId)
    }
  },
  methods: {
    getSection (sectionId) {
      return _.find(this.sections, {id: sectionId})
    },
    getSectionName (section) {
      let name = section.name
      do {
        section = this.getSection(section.parent_section_id)
        name = section ? section.name + ' > ' + name : name
      } while (section)

      return name
    },
    answer (item, order) {
      const questionType = this.getQuestionType(item.question_type_id)
      const responses = this.form.responses.filter((response) => {
        return response.question_id === item.id && response.order === order
      })
      let response = ''
      switch (questionType) {
        case 'Short answer':
        case 'Paragraph':
        case 'Date':
        case 'Time':
        case 'Linear scale':
        case 'Number':
        case 'Decimal':
        case 'Email':
        case 'Percent':
        case 'Phone number':
        case 'URL':
          if (responses.length) {
            response = responses[0].response
          }
          break
        case 'File upload':
          if (responses.length) {
            response = '<a href="' + responses[0].response + '" target="_blank">Download File</a>'
          }
          break
        case 'Multiple choice':
        case 'Checkboxes':
        case 'Dropdown':
        case 'Country':
          const result = responses.map((response) => {
            const answer = item.answers.find((answer) => {
              return answer.id === response.answer_id
            })
            return answer.answer
          })
          response = result.join(', ')
          break
        case 'Multiple choice grid':
        case 'Checkbox grid':
          const result1 = responses.map((response) => {
            const answer = item.answers.find((answer) => {
              return answer.id === response.answer_id
            })
            const res = item.answers.find((answer) => {
              return answer.id === parseInt(response.response)
            })
            return '(' + answer.answer + ', ' + res.answer + ')'
          })
          response = result1.join(', ')
          break
        case 'Address':
        case 'ABN Lookup':
          const result2 = responses.map((response) => {
            const answer = item.answers.find((answer) => {
              return answer.id === response.answer_id
            })
            return '(' + answer.answer + ', ' + response.response + ')'
          })
          response = result2.join(', ')
          break
        case 'Lookup':
          if (!item.answers.length) {
            break
          }
          const value = JSON.parse(item.answers[0].answer)
          const editFormTemplateId = value.formTemplateId
          if (editFormTemplateId) {
            const editQuestionId = value.questionId
            const editQuestion = this.$store.getters.loadedAllQuestion(editFormTemplateId, editQuestionId)
            const forms = this.$store.getters.loadedForms(editFormTemplateId)
            const questionResponses = []
            _.forEach(forms, (form, index) => {
              const formResponses = form.responses.filter(response => response.question_id === editQuestionId)
              _.forEach(formResponses, (formResponse, index) => {
                const response = this.questionToResponse(editQuestion, [formResponse])
                questionResponses.push({id: formResponse.id, response: response})
              })
            })
            const lookupResult = responses.map(response => {
              const re = questionResponses.find(questionResponse => questionResponse.id === parseInt(response.response))
              if (!re) {
                return ''
              }
              return re.response
            })
            response = lookupResult.join(', ')
          }
          break
        case 'Content Block':
          response = item.description
          break
      }
      return response
    }
  }
}
