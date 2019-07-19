const API_URL = process.env.API_URL
const QUESTION_URL = `${API_URL}question/`
const ANSWER_URL = '/answer'
const CHANGE_URL = '/delete'
const MOVE_URL = '/move'

export default {
  actions: {
    loadAnswers ({commit}, payload) {
      commit('setLoading', true)
      window.axios.get(QUESTION_URL + payload.questionId + ANSWER_URL)
        .then(
          response => {
            commit('setLoading', false)
            const createObj = {
              formTemplateId: payload.formTemplateId,
              sectionId: payload.sectionId,
              questionId: payload.questionId,
              answers: response['data']['answers']
            }
            commit('setLoadedAnswers', createObj)
          }
        )
        .catch(
          error => {
            commit('setLoading', false)
            console.log(error)
          }
        )
    },
    createAnswer ({commit, getters}, payload) {
      const answer = {
        answer: payload.answer,
        parameter: payload.parameter
      }
      window.axios.post(QUESTION_URL + payload.questionId + ANSWER_URL, answer)
        .then(
          response => {
            commit('setLoading', false)
            const createdObj = {
              formTemplateId: payload.formTemplateId,
              sectionId: payload.sectionId,
              questionId: payload.questionId,
              answer: response['data']['answer']
            }
            commit('createAnswer', createdObj)
          }
        )
        .catch(
          error => {
            commit('setLoading', false)
            console.log(error)
          }
        )
    },
    updateAnswer ({commit}, payload) {
      commit('setLoading', true)
      const updateObj = {}
      if (payload.answer) {
        updateObj.answer = payload.answer
      }
      if (payload.parameter !== null) {
        updateObj.parameter = payload.parameter
      }
      window.axios.put(QUESTION_URL + payload.questionId + ANSWER_URL + '/' + payload.id, updateObj)
        .then(
          response => {
            commit('setLoading', false)
            const updateObj = {
              formTemplateId: payload.formTemplateId,
              sectionId: payload.sectionId,
              questionId: payload.questionId,
              answer: response['data']['answer']
            }
            commit('updateAnswer', updateObj)
          }
        )
        .catch(error => {
          console.log(error)
          commit('setLoading', false)
        })
    },
    moveAnswer ({commit}, payload) {
      commit('setLoading', true)
      const updateObj = {}
      if (payload.order) {
        updateObj.order = payload.order
      }
      window.axios.post(QUESTION_URL + payload.questionId + ANSWER_URL + '/' + payload.id + MOVE_URL, updateObj)
        .then(
          response => {
            commit('setLoading', false)
            const updateObj = {
              formTemplateId: payload.formTemplateId,
              sectionId: payload.sectionId,
              question: response['data']['data']
            }
            commit('updateQuestion', updateObj)
          }
        )
        .catch(error => {
          console.log(error)
          commit('setLoading', false)
        })
    },
    deleteAnswer ({commit}, payload) {
      commit('setLoading', true)
      window.axios.delete(QUESTION_URL + payload.questionId + ANSWER_URL + '/' + payload.id)
        .then(() => {
          commit('setLoading', false)
          commit('deleteAnswer', payload)
        })
        .catch(error => {
          console.log(error)
          commit('setLoading', false)
        })
    },
    deleteAnswers ({commit}, payload) {
      commit('setLoading', true)
      window.axios.delete(QUESTION_URL + payload.questionId + ANSWER_URL)
        .then(() => {
          commit('setLoading', false)
          commit('deleteAnswers', payload)
        })
        .catch(error => {
          console.log(error)
          commit('setLoading', false)
        })
    },
    changeAnswers ({commit}, payload) {
      commit('setLoading', true)
      window.axios.delete(QUESTION_URL + payload.questionId + ANSWER_URL + CHANGE_URL)
        .then(() => {
          commit('setLoading', false)
          commit('changeAnswers', payload)
        })
        .catch(error => {
          console.log(error)
          commit('setLoading', false)
        })
    }
  },
  getters: {
    loadedAnswers (state, getters, rootState) {
      return (formTemplateId, sectionId, questionId) => {
        if (!rootState.section.loadedSections[formTemplateId]) {
          return []
        }
        const section = rootState.section.loadedSections[formTemplateId].find((section) => {
          return section.id === sectionId
        })
        if (!section) {
          return []
        }
        const question = section.questions.find((question) => {
          return question.id === questionId
        })
        if (!question) {
          return []
        }
        return question.answers
      }
    },
    loadedAnswer (state, getters, rootState) {
      return (formTemplateId, sectionId, questionId, answerId) => {
        if (!rootState.section.loadedSections[formTemplateId]) {
          return null
        }
        const section = rootState.section.loadedSections[formTemplateId].find((section) => {
          return section.id === sectionId
        })
        if (!section) {
          return null
        }
        const question = section.questions.find((question) => {
          return question.id === questionId
        })
        if (!question) {
          return null
        }
        return question.answers.find((answer) => {
          return answer.id === answerId
        })
      }
    }
  }
}
