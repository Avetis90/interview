import * as _ from 'lodash'
export default {
  computed: {
    questionTypes () {
      return this.$store.getters.questionTypes
    },
    triggerTypes () {
      return this.$store.getters.triggerTypes
    },
    comparators () {
      return this.$store.getters.comparators
    },
    statuses () {
      return this.$store.getters.statuses
    }
  },
  methods: {
    getComparator (comparatorId) {
      const comparator = this.comparators.find((comparator) => {
        return comparator.id === comparatorId
      })
      return comparator ? comparator.comparator : 'undefined'
    },
    getQuestionType (questionTypeId) {
      const questionType = this.questionTypes.find((questionType) => {
        return questionType.id === questionTypeId
      })
      return questionType ? questionType.type : 'undefined'
    },
    getStatus (statusId) {
      const status = this.statuses.find((status) => {
        return status.id === statusId
      })
      return status ? status.status : 'undefined'
    },
    triggerType (questionTypeId, comparatorId) {
      return this.triggerTypes.filter((triggerType) => {
        return triggerType.question_type_id === questionTypeId && triggerType.comparator_id === comparatorId
      })[0]
    },
    // Question, Responses, ComparatorID, QuestionTrigger.answer, QuestionTrigger.value
    compareResponse (question, parentResponses, comparatorID, answer, value) {
      let questionTypeID = question.question_type_id
      let triggerType = this.triggerType(questionTypeID, comparatorID)
      if (!triggerType) {
        return true
      }
      let answerF = triggerType.answer
      let valueF = triggerType.value
      let questionAnswer = ''
      let questionValue = ''
      if (parentResponses.length > 0) {
        if (this.getQuestionType(questionTypeID) === 'Checkboxes' || this.getQuestionType(questionTypeID) === 'Dropdown' || this.getQuestionType(questionTypeID) === 'Country') {
          let filteredResponses = parentResponses.filter(function (parentResponse) {
            return parentResponse.answer_id === answer
          })
          if (filteredResponses.length > 0) {
            questionAnswer = answer.toString()
          }
        } else if (this.getQuestionType(questionTypeID) === 'Checkbox grid' || this.getQuestionType(questionTypeID) === 'Multiple choice grid' || this.getQuestionType(questionTypeID) === 'Address' || this.getQuestionType(questionTypeID) === 'ABN Lookup') {
          let filteredResponses = parentResponses.filter(function (parentResponse) {
            return parentResponse.answer_id === answer && parentResponse.response === value
          })
          if (filteredResponses.length > 0) {
            questionAnswer = answer.toString()
            questionValue = value
          }
        } else {
          if (parentResponses[0].answer_id) {
            questionAnswer = parentResponses[0].answer_id.toString()
          }
          questionValue = parentResponses[0].response
        }
      }

      answer = answer ? answer.toString() : null
      const comparator = this.getComparator(comparatorID)
      const values = value ? value.split(',').map((value) => value.trim()) : []
      let listValue = parentResponses.map((value) => value.response)
      if (this.getQuestionType(questionTypeID) === 'Checkboxes' || this.getQuestionType(questionTypeID) === 'Dropdown' || this.getQuestionType(questionTypeID) === 'Multiple choice' || this.getQuestionType(questionTypeID) === 'Country') {
        listValue = parentResponses.map((value) => question.answers.find((answer) => { return answer.id === value.answer_id }).answer)
      }
      switch (comparator) {
        case 'equals':
          if (!answerF) {
            if (questionValue === value) {
              return true
            }
          } else {
            if (!valueF) {
              return questionAnswer === answer
            } else {
              return questionAnswer === answer && questionValue === value
            }
          }
          break
        case 'not equal to':
          if (!answerF) {
            if (questionValue !== value) {
              return true
            }
          } else {
            if (!valueF) {
              return questionAnswer !== answer
            } else {
              return questionAnswer === answer && questionValue !== value
            }
          }
          break
        case 'less than':
          if (!answerF) {
            if (parseFloat(questionValue) < parseFloat(value)) {
              return true
            }
          } else {
            if (parseFloat(questionAnswer) < parseFloat(answer)) {
              return true
            }
          }
          break
        case 'greater than':
          if (!answerF) {
            if (parseFloat(questionValue) > parseFloat(value)) {
              return true
            }
          } else {
            if (parseFloat(questionAnswer) > parseFloat(answer)) {
              return true
            }
          }
          break
        case 'less than or equal to':
          if (!answerF) {
            if (parseFloat(questionValue) <= parseFloat(value)) {
              return true
            }
          } else {
            if (parseFloat(questionAnswer) <= parseFloat(answer)) {
              return true
            }
          }
          break
        case 'greater than or equal to':
          if (!answerF) {
            if (parseFloat(questionValue) >= parseFloat(value)) {
              return true
            }
          } else {
            if (parseFloat(questionAnswer) >= parseFloat(answer)) {
              return true
            }
          }
          break
        case 'contains':
          if (this.getQuestionType(questionTypeID) === 'Dropdown' || this.getQuestionType(questionTypeID) === 'Country') {
            return listValue.filter(element => element.includes(value)).length > 0
          } else if (this.getQuestionType(questionTypeID) === 'Checkboxes') {
            return questionAnswer === answer
          } else if (this.getQuestionType(questionTypeID) === 'Checkbox grid' || this.getQuestionType(questionTypeID) === 'Multiple choice grid' || this.getQuestionType(questionTypeID) === 'Address' || this.getQuestionType(questionTypeID) === 'ABN Lookup') {
            return questionAnswer === answer && questionValue === value
          } else {
            if (!answerF) {
              return _.includes(questionValue, value)
            } else if (!valueF) {
              return _.includes(questionAnswer, answer)
            } else {
              return _.includes(questionAnswer, answer) && _.includes(questionValue, value)
            }
          }
        case 'not contains':
          if (this.getQuestionType(questionTypeID) === 'Dropdown' || this.getQuestionType(questionTypeID) === 'Country') {
            return listValue.filter(element => element.includes(value)).length === 0
          } else if (this.getQuestionType(questionTypeID) === 'Checkboxes') {
            return questionAnswer !== answer
          } else if (this.getQuestionType(questionTypeID) === 'Checkbox grid' || this.getQuestionType(questionTypeID) === 'Multiple choice grid' || this.getQuestionType(questionTypeID) === 'Address' || this.getQuestionType(questionTypeID) === 'ABN Lookup') {
            return questionAnswer !== answer || questionValue !== value
          } else {
            if (!answerF) {
              return !_.includes(questionValue, value)
            } else if (!valueF) {
              return !_.includes(questionAnswer, answer)
            } else {
              return !_.includes(questionAnswer, answer) || !_.includes(questionValue, value)
            }
          }
        case 'starts with':
          if (!answerF) {
            return _.startsWith(questionValue, value)
          } else {
            return _.startsWith(questionAnswer, answer)
          }
        case 'ends with':
          if (!answerF) {
            return _.endsWith(questionValue, value)
          } else {
            return _.endsWith(questionAnswer, answer)
          }
        case 'is null':
          if (parentResponses.length > 0) {
            return false
          } else {
            return true
          }
        case 'is not null':
          if (parentResponses.length > 0) {
            return true
          } else {
            return false
          }
        case 'in list':
          return listValue.filter(value => values.indexOf(value) !== -1).length > 0
        case 'not in list':
          return listValue.filter(value => values.indexOf(value) !== -1).length === 0
        case 'is invalid':
          if (parentResponses.length > 0) {
            return JSON.parse(questionValue)['Abn'] === ''
          } else {
            return false
          }
        default:
          break
      }

      return false
    },
    questionToResponse (item, responses) {
      const questionType = this.getQuestionType(item.question_type_id)
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
            return answer ? answer.answer : null
          })
          response = result.join(', ')
          break
        case 'Multiple choice grid':
        case 'Checkbox grid':
        case 'Address':
        case 'ABN Lookup':
          const result1 = responses.map((response) => {
            const answer = item.answers.find((answer) => {
              return answer.id === response.answer_id
            })
            return answer.answer + ': ' + response.response
          })
          response = result1.join(', ')
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
