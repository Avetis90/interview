const API_URL = process.env.API_URL
const FORM_TEMPLATE_URL = `${API_URL}form-templates/`
const VALIDATION_URL = '/validation'

export default {
  state: {
    loadedValidations: []
  },
  mutations: {
    clearLoadedValidations (state) {
      state.loadedValidations = {}
    },
    setLoadedValidations (state, payload) {
      let validations = Object.assign({}, state.loadedValidations)
      validations[payload.formTemplateId] = payload.validations
      state.loadedValidations = validations
    },
    createValidation (state, payload) {
      let validations = Object.assign({}, state.loadedValidations)
      if (!validations[payload.formTemplateId]) {
        validations[payload.formTemplateId] = []
      }
      validations[payload.formTemplateId].push(payload.validation)
      state.loadedValidations = validations
    },
    updateValidation (state, payload) {
      let validations = Object.assign({}, state.loadedValidations)
      const index = validations[payload.formTemplateId].findIndex(validation => {
        return validation.id === payload.validation.id
      })
      validations[payload.formTemplateId].splice(index, 1, payload.validation)
      state.loadedValidations = validations
    },
    deleteValidation (state, payload) {
      let validations = Object.assign({}, state.loadedValidations)
      validations[payload.formTemplateId] = validations[payload.formTemplateId].filter(e => {
        return e.id !== payload.id
      })
      state.loadedValidations = validations
    }
  },
  actions: {
    loadValidations ({commit}, formTemplateId) {
      commit('setLoading', true)
      window.axios.get(FORM_TEMPLATE_URL + formTemplateId + VALIDATION_URL)
        .then(
          response => {
            commit('setLoading', false)
            const createObj = {
              formTemplateId: formTemplateId,
              validations: response['data']['validations']
            }
            commit('setLoadedValidations', createObj)
          }
        )
        .catch(
          error => {
            commit('setLoading', false)
            console.log(error)
          }
        )
    },
    createValidation ({commit, getters}, payload) {
      let validation = {
        question_id: payload.questionId,
        validation_type_id: payload.validationTypeId,
        validation_data: payload.validationData
      }
      window.axios.post(FORM_TEMPLATE_URL + payload.formTemplateId + VALIDATION_URL, validation)
        .then(
          response => {
            commit('setLoading', false)
            const createObj = {
              formTemplateId: payload.formTemplateId,
              validation: response['data']['validation']
            }
            commit('createValidation', createObj)
          }
        )
        .catch(
          error => {
            commit('setLoading', false)
            console.log(error)
          }
        )
    },
    updateValidation ({commit}, payload) {
      commit('setLoading', true)
      const updateObj = {}
      if (payload.questionId) {
        updateObj.question_id = payload.questionId
      }
      if (payload.validationTypeId) {
        updateObj.validation_type_id = payload.validationTypeId
      }
      if (payload.validationData) {
        updateObj.validation_data = payload.validationData
      }
      window.axios.put(FORM_TEMPLATE_URL + payload.formTemplateId + VALIDATION_URL + '/' + payload.id, updateObj)
        .then(
          response => {
            commit('setLoading', false)
            const updateObj = {
              formTemplateId: payload.formTemplateId,
              validation: response['data']['validation']
            }
            commit('updateValidation', updateObj)
          }
        )
        .catch(error => {
          console.log(error)
          commit('setLoading', false)
        })
    },
    deleteValidation ({commit}, payload) {
      commit('setLoading', true)
      window.axios.delete(FORM_TEMPLATE_URL + payload.formTemplateId + VALIDATION_URL + '/' + payload.id)
        .then(() => {
          commit('setLoading', false)
          commit('deleteValidation', payload)
        })
        .catch(error => {
          console.log(error)
          commit('setLoading', false)
        })
    }
  },
  getters: {
    loadedValidations (state) {
      return (formTemplateId) => {
        if (!state.loadedValidations[formTemplateId]) {
          return []
        }
        return state.loadedValidations[formTemplateId]
      }
    },
    loadedValidation (state) {
      return (formTemplateId, validationId) => {
        if (!state.loadedValidations[formTemplateId]) {
          return null
        }
        return state.loadedValidations[formTemplateId].find((validation) => {
          return validation.id === validationId
        })
      }
    },
    loadedQuestionValidation (state) {
      return (formTemplateId, questionId) => {
        if (!state.loadedValidations[formTemplateId]) {
          return []
        }
        return state.loadedValidations[formTemplateId].filter((validation) => {
          return validation.question_id === questionId
        })
      }
    }
  }
}
