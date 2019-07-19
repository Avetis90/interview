const API_URL = process.env.API_URL
const SECTION_URL = `${API_URL}section/`
const QUESTION_URL = '/question'
const MOVE_URL = '/move'

export default {
  actions: {
    loadQuestion ({commit}, payload) {
      commit('setLoading', true)
      window.axios.get(SECTION_URL + payload.sectionId + QUESTION_URL + '/' + payload.id)
        .then(
          response => {
            commit('setLoading', false)
            const loadedObj = {
              formTemplateId: payload.formTemplateId,
              sectionId: payload.sectionId,
              question: response['data']['question']
            }
            commit('updateQuestion', loadedObj)
          }
        )
        .catch(
          error => {
            commit('setLoading', false)
            console.log(error)
          }
        )
    },
    loadQuestions ({commit}, payload) {
      commit('setLoading', true)
      window.axios.get(SECTION_URL + payload.sectionId + QUESTION_URL)
        .then(
          response => {
            commit('setLoading', false)
            const createObj = {
              formTemplateId: payload.formTemplateId,
              sectionId: payload.sectionId,
              questions: response['data']['questions']
            }
            commit('setLoadedQuestions', createObj)
          }
        )
        .catch(
          error => {
            commit('setLoading', false)
            console.log(error)
          }
        )
    },
    createQuestion ({commit, getters}, payload) {
      const question = {
        question: payload.question,
        description: payload.description,
        mandatory: payload.mandatory,
        question_type_id: payload.questionTypeId,
        width: 12,
        key: payload.key
      }
      window.axios.post(SECTION_URL + payload.sectionId + QUESTION_URL, question)
        .then(
          response => {
            commit('setLoading', false)
            const createdObj = {
              formTemplateId: payload.formTemplateId,
              sectionId: payload.sectionId,
              question: response['data']['question']
            }
            commit('createQuestion', createdObj)
          }
        )
        .catch(
          error => {
            commit('setLoading', false)
            console.log(error)
          }
        )
    },
    updateQuestion ({commit}, payload) {
      commit('setLoading', true)
      const updateObj = {}
      if (payload.question) {
        updateObj.question = payload.question
      }
      if (payload.description !== undefined) {
        updateObj.description = payload.description
      }
      if (payload.questionTypeId) {
        updateObj.question_type_id = payload.questionTypeId
      }
      if (payload.sortId) {
        updateObj.sort_id = payload.sortId
      }
      if (payload.mandatory !== undefined) {
        updateObj.mandatory = payload.mandatory
      }
      if (payload.width) {
        updateObj.width = payload.width
      }
      if (payload.key) {
        updateObj.key = payload.key
      }
      window.axios.put(SECTION_URL + payload.sectionId + QUESTION_URL + '/' + payload.id, updateObj)
        .then(
          response => {
            commit('setLoading', false)
            const updateObj = {
              formTemplateId: payload.formTemplateId,
              sectionId: payload.sectionId,
              question: response['data']['question']
            }
            commit('updateQuestion', updateObj)
          }
        )
        .catch(error => {
          console.log(error)
          commit('setLoading', false)
        })
    },
    duplicateQuestion ({commit}, payload) {
      commit('setLoading', true)
      window.axios.post(SECTION_URL + payload.sectionId + QUESTION_URL + '/' + payload.id)
        .then(
          response => {
            commit('setLoading', false)
            const createdObj = {
              formTemplateId: payload.formTemplateId,
              sectionId: payload.sectionId,
              question: response['data']['question']
            }
            commit('duplicateQuestion', createdObj)
          }
        )
        .catch(error => {
          console.log(error)
          commit('setLoading', false)
        })
    },
    moveQuestion ({commit}, payload) {
      commit('setLoading', true)
      const moveObj = {
        parent_section_id: payload.parentSectionId,
        order: payload.order
      }
      window.axios.post(SECTION_URL + payload.oldParentSectionId + QUESTION_URL + '/' + payload.questionId + MOVE_URL, moveObj)
        .then(
          response => {
            commit('setLoading', false)
            const updateObj = {
              formTemplateId: payload.formTemplateId,
              questionId: payload.questionId,
              oldSectionId: payload.oldParentSectionId,
              order: payload.order,
              section: response['data']['data']
            }
            commit('moveQuestion', updateObj)
          }
        )
        .catch(error => {
          console.log(error)
          commit('setLoading', false)
        })
    },
    deleteQuestion ({commit}, payload) {
      commit('setLoading', true)
      window.axios.delete(SECTION_URL + payload.sectionId + QUESTION_URL + '/' + payload.id)
        .then(() => {
          commit('setLoading', false)
          commit('deleteQuestion', payload)
        })
        .catch(error => {
          console.log(error)
          commit('setLoading', false)
        })
    },
    deleteQuestions ({commit}, payload) {
      commit('setLoading', true)
      window.axios.delete(SECTION_URL + payload.sectionId + QUESTION_URL)
        .then(() => {
          commit('setLoading', false)
          commit('deleteQuestions', payload)
        })
        .catch(error => {
          console.log(error)
          commit('setLoading', false)
        })
    }
  },
  getters: {
    loadedQuestions (state, getters, rootState) {
      return (formTemplateId, sectionId) => {
        if (!rootState.section.loadedSections[formTemplateId]) {
          return []
        }
        const section = rootState.section.loadedSections[formTemplateId].find((section) => {
          return section.id === sectionId
        })
        if (!section) {
          return []
        }
        return section.questions.sort((questionA, questionB) => {
          return questionA.order > questionB.order
        })
      }
    },
    loadedAllQuestions (state, getters, rootState) {
      return (formTemplateId) => {
        if (!rootState.section.loadedSections[formTemplateId]) {
          return []
        }
        let questions = []
        for (let i = 0; i < rootState.section.loadedSections[formTemplateId].length; i++) {
          questions = questions.concat(rootState.section.loadedSections[formTemplateId][i].questions)
        }
        return questions
      }
    },
    loadedApplicationQuestions (state, getters, rootState) {
      return (slug) => {
        if (!rootState.formTemplate.loadedFormTemplates[slug]) {
          return []
        }
        const formTemplates = rootState.formTemplate.loadedFormTemplates[slug]
        let questions = []
        for (let j = 0; j < formTemplates.length; j++) {
          if (!rootState.section.loadedSections[formTemplates[j].id]) {
            continue
          }
          for (let i = 0; i < rootState.section.loadedSections[formTemplates[j].id].length; i++) {
            for (let k = 0; k < rootState.section.loadedSections[formTemplates[j].id][i].questions.length; k++) {
              let question = rootState.section.loadedSections[formTemplates[j].id][i].questions[k]
              question['section_name'] = rootState.section.loadedSections[formTemplates[j].id][i].name
              question['form_template_name'] = formTemplates[j].name
              questions.push(question)
            }
          }
        }
        return questions
      }
    },
    loadedQuestion (state, getters, rootState) {
      return (formTemplateId, sectionId, questionId) => {
        if (!rootState.section.loadedSections[formTemplateId]) {
          return null
        }
        const section = rootState.section.loadedSections[formTemplateId].find((section) => {
          return section.id === sectionId
        })
        if (!section) {
          return null
        }
        return section.questions.find((question) => {
          return question.id === questionId
        })
      }
    },
    loadedAllQuestion (state, getters, rootState) {
      return (formTemplateId, questionId) => {
        if (!rootState.section.loadedSections[formTemplateId]) {
          return null
        }
        for (let i = 0; i < rootState.section.loadedSections[formTemplateId].length; i++) {
          let question = rootState.section.loadedSections[formTemplateId][i].questions.find((question) => {
            return question.id === questionId
          })
          if (question) {
            return question
          }
        }
        return null
      }
    }
  }
}
