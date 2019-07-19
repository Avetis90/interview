import * as _ from 'lodash'
export default {
  computed: {
    allResponses () {
      const formId = parseInt(this.formId)

      if (!this.$store.getters || !this.$store.getters.formById(formId)) {
        return []
      }

      return this.$store.getters.formById(formId).responses || []
    },
    questionTypes () {
      return this.$store.getters.questionTypes
    },
    triggerTypes () {
      return this.$store.getters.triggerTypes
    },
    comparators () {
      return this.$store.getters.comparators
    }
  },
  methods: {
    progress (formTemplateId, formId) {
      const sections = this.$store.getters.loadedSections(formTemplateId)
      let questionCount = 0
      let responseCount = 0
      sections.forEach(function (section) {
        if (this.isSectionTrigger(section)) {
          return
        }
        if (section.repeatable) {
          for (let i = 1; i <= section.repeatable; i++) {
            let questions = section.questions.filter(question => question.mandatory && !this.isTrigger(question, i))
            questions.forEach(function (question) {
              let responses = this.$store.getters.loadedResponses(formTemplateId, formId).filter(response => response.question_id === question.id && response.order === i)
              let responseLength = responses.length ? 1 : 0
              let questionLength = 1
              if (this.getQuestionType(question.question_type_id) === 'Multiple choice grid' || this.getQuestionType(question.question_type_id) === 'Checkbox grid') {
                responseLength = [...new Set(responses.map(response => response.answer_id))].length
                questionLength = question.answers.filter(answer => !answer.parameter).length
              }
              questionCount += questionLength
              responseCount += responseLength
            }, this)
          }
        } else {
          let questions = section.questions.filter(question => question.mandatory && !this.isTrigger(question, 1))
          questions.forEach(function (question) {
            let responses = this.$store.getters.loadedResponses(formTemplateId, formId).filter(response => response.question_id === question.id)
            let responseLength = responses.length ? 1 : 0
            let questionLength = 1
            if (this.getQuestionType(question.question_type_id) === 'Multiple choice grid' || this.getQuestionType(question.question_type_id) === 'Checkbox grid') {
              responseLength = [...new Set(responses.map(response => response.answer_id))].length
              questionLength = question.answers.filter(answer => !answer.parameter).length
            }
            questionCount += questionLength
            responseCount += responseLength
          }, this)
        }
      }, this)

      let progress = questionCount !== 0 ? responseCount * 100 / questionCount : 0
      return progress < 0 ? 0 : progress > 100 ? 100 : progress
    },
    sectionProgress (formTemplateId, sectionId, formId) {
      const section = this.$store.getters.loadedSection(formTemplateId, sectionId)
      let questionCount = 0
      let responseCount = 0
      if (this.isSectionTrigger(section)) {
        return 100
      }
      if (section.repeatable) {
        for (let i = 1; i <= section.repeatable; i++) {
          let questions = section.questions.filter(question => question.mandatory && !this.isTrigger(question, i))
          questions.forEach(function (question) {
            let responses = this.$store.getters.loadedResponses(formTemplateId, formId).filter(response => response.question_id === question.id && response.order === i)
            let responseLength = responses.length ? 1 : 0
            let questionLength = 1
            if (this.getQuestionType(question.question_type_id) === 'Multiple choice grid' || this.getQuestionType(question.question_type_id) === 'Checkbox grid') {
              responseLength = [...new Set(responses.map(response => response.answer_id))].length
              questionLength = question.answers.filter(answer => !answer.parameter).length
            }
            questionCount += questionLength
            responseCount += responseLength
          }, this)
        }
      } else {
        const childrenSections = this.$store.getters.loadedChildrenSection(formTemplateId, sectionId)
        if (childrenSections.length) {
          let _this = this
          let progress = 100
          childrenSections.forEach(function (section) {
            const childProgress = _this.sectionProgress(formTemplateId, section.id, formId)
            if (childProgress !== 100) {
              progress = 0
            }
          })
          return progress
        } else {
          let questions = section.questions.filter(question => question.mandatory && !this.isTrigger(question, 1))
          questions.forEach(function (question) {
            let responses = this.$store.getters.loadedResponses(formTemplateId, formId).filter(response => response.question_id === question.id)
            let responseLength = responses.length ? 1 : 0
            let questionLength = 1
            if (this.getQuestionType(question.question_type_id) === 'Multiple choice grid' || this.getQuestionType(question.question_type_id) === 'Checkbox grid') {
              responseLength = [...new Set(responses.map(response => response.answer_id))].length
              questionLength = question.answers.filter(answer => !answer.parameter).length
            }
            questionCount += questionLength
            responseCount += responseLength
          }, this)
        }
      }
      let progress = questionCount !== 0 ? responseCount * 100 / questionCount : 100
      return progress < 0 ? 0 : progress > 100 ? 100 : progress
    },
    isSectionTrigger (item) {
      if (!item) {
        return false
      }
      let hideSectionTrigger = true
      const $this = this
      if (this.isTrigger(item, 1)) {
        return true
      } else if (!item.questions.length) {
        let childrenSection = this.$store.getters.loadedChildrenSection(this.formTemplateId, item.id)
        _.forEach(childrenSection, function (section) {
          if (!$this.isSectionTrigger(section)) {
            hideSectionTrigger = false
          }
        })
      } else {
        let questions = item.questions
        _.forEach(questions, function (question) {
          if (!$this.isTrigger(question, 1)) {
            hideSectionTrigger = false
          }
        })
      }
      return hideSectionTrigger
    },
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
    isTrigger (question, order) {
      if (!question) {
        return false
      }
      let type = (question.questions ? 'Section' : 'Question')
      let questionTriggers = this.$store.getters.loadedQuestionTrigger(this.formTemplateId, question.id)
      questionTriggers = questionTriggers.filter((trigger) => {
        if (type === 'Section') {
          return trigger.type === 'Section'
        } else {
          return trigger.type !== 'Section'
        }
      })
      questionTriggers = _.sortBy(questionTriggers, element => {
        return element.order
      })
      if (!questionTriggers.length) {
        return false
      }

      let tempF = true
      let index = 0

      while (index < questionTriggers.length) {
        const questionTrigger = questionTriggers[index]
        const parentQuestion = this.$store.getters.loadedAllQuestion(this.formTemplateId, parseInt(questionTrigger.parent_question_id))
        tempF = tempF && this.compareCondition(questionTrigger, order) && !this.isTrigger(parentQuestion, order)
        if ((questionTrigger.operator === 1 || questionTrigger.operator === true) && (questionTriggers.length - 1 !== index)) {
          if (tempF) {
            return false
          }
          tempF = true
        }
        index++
      }
      return !tempF
    },
    compareCondition (questionTrigger, order) {
      let question = this.$store.getters.loadedAllQuestion(this.formTemplateId, parseInt(questionTrigger.parent_question_id))
      if (!question) {
        return true
      }
      let parentResponses = this.parentResponses(questionTrigger.parent_question_id).filter((response) => {
        return response.order === order
      })
      let triggerType = this.triggerType(question.question_type_id, questionTrigger.comparator_id)
      if (!triggerType) {
        return true
      }

      let questionTypeID = question.question_type_id
      let comparatorID = questionTrigger.comparator_id
      let answerF = triggerType.answer
      let valueF = triggerType.value
      let answer = questionTrigger.parent_answer_id
      let value = questionTrigger.value

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
    parentResponses (questionId) {
      return this.allResponses.filter((response) => {
        return response.question_id === questionId
      })
    },
    triggerType (questionTypeId, comparatorId) {
      return this.triggerTypes.filter((triggerType) => {
        return triggerType.question_type_id === questionTypeId && triggerType.comparator_id === comparatorId
      })[0]
    }
  }
}
