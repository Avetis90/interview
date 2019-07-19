const API_URL = process.env.API_URL
const FORM_URL = `${API_URL}form/`
const RESPONSE_URL = '/response'

export default {
  actions: {
    loadResponses ({commit}, payload) {
      commit('setLoading', true)
      window.axios.get(FORM_URL + payload.formId + RESPONSE_URL)
        .then(
          response => {
            commit('setLoading', false)
            const createObj = {
              formTemplateId: payload.formTemplateId,
              formId: payload.formId,
              responses: response['data']['responses']
            }
            commit('setLoadedResponses', createObj)
          }
        )
        .catch(
          error => {
            commit('setLoading', false)
            console.log(error)
          }
        )
    },
    createResponse ({commit, getters}, payload) {
      const response = {
        response: payload.response,
        question_id: payload.questionId,
        answer_id: payload.answerId
      }

      if (payload.order !== undefined) {
        response.order = payload.order
      }

      return new Promise((resolve, reject) => {
        window.axios.post(FORM_URL + payload.formId + RESPONSE_URL, response)
          .then(
            response => {
              commit('setLoading', false)
              const createdObj = {
                formTemplateId: payload.formTemplateId,
                formId: payload.formId,
                response: response['data']['response']
              }
              commit('createResponse', createdObj)
              resolve(response)
            }
          )
          .catch(
            error => {
              commit('setLoading', false)
              console.log(error)
              reject(error)
            }
          )
      })
    },
    updateResponse ({commit}, payload) {
      commit('setLoading', true)
      const updateObj = {
        response: payload.response,
        answer_id: payload.answerId,
        question_id: payload.questionId
      }
      if (payload.order) {
        updateObj.order = payload.order
      }

      return new Promise((resolve, reject) => {
        window.axios.put(FORM_URL + payload.formId + RESPONSE_URL + '/' + payload.id, updateObj)
          .then(
            (response) => {
              commit('setLoading', false)
              const updateObj = {
                formTemplateId: payload.formTemplateId,
                formId: payload.formId,
                oldId: payload.id,
                response: response['data']['response']
              }
              commit('updateResponse', updateObj)
              resolve(response)
            }
          )
          .catch(
            (error) => {
              console.log(error)
              commit('setLoading', false)
              reject(error)
            }
          )
      })
    },
    deleteSectionResponse ({commit}, payload) {
      commit('setLoading', true)

      return new Promise((resolve, reject) => {
        window.axios.delete(FORM_URL + payload.formId + RESPONSE_URL + '/section/' + payload.sectionId + '/' + payload.order)
          .then(response => {
            commit('setLoading', false)
            const createObj = {
              formTemplateId: payload.formTemplateId,
              formId: payload.formId,
              responses: response['data']['responses']
            }
            commit('setLoadedResponses', createObj)
            resolve(response)
          })
          .catch(
            error => {
              console.log(error)
              commit('setLoading', false)
              reject(error)
            }
          )
      })
    },
    deleteResponse ({commit}, payload) {
      commit('setLoading', true)

      return new Promise((resolve, reject) => {
        window.axios.delete(FORM_URL + payload.formId + RESPONSE_URL + '/' + payload.id)
          .then(response => {
            commit('setLoading', false)
            commit('deleteResponse', payload)
            resolve(response)
          })
          .catch(
            error => {
              console.log(error)
              commit('setLoading', false)
              reject(error)
            }
          )
      })
    }
  },
  getters: {
    loadedResponses (state, getters, rootState) {
      return (formTemplateId, formId) => {
        if (!rootState.form.loadedForms[formTemplateId]) {
          return []
        }

        const form = rootState.form.loadedForms[formTemplateId].find((form) => {
          return form.id === formId
        })

        if (!form) {
          return []
        }
        return form.responses ? form.responses : []
      }
    },
    loadedResponse (state, getters, rootState) {
      return (formTemplateId, formId, responseId) => {
        if (!rootState.form.loadedForms[formTemplateId]) {
          return null
        }

        const form = rootState.form.loadedForms[formTemplateId].find((form) => {
          return form.id === formId
        })

        if (!form) {
          return null
        }
        return form.responses.find((response) => {
          return response.id === responseId
        })
      }
    }
  }
}
