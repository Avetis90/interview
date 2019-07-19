const API_URL = process.env.API_URL
const FORM_TEMPLATE_URL = `${API_URL}form-templates/`
const APPLICATION_URL = `${API_URL}application/`
const USER_URL = '/user'
const FORM_URL = '/form'
const FORMS_URL = '/forms'

export default {
  state: {
    loadedForms: {}
  },
  getters: {
    forms: state => [].concat(...Object.values(state.loadedForms)),
    formsByFormTemplateId: (state, getters) => id => state.loadedForms[id] || [],
    formById: (state, getters) => id => getters.forms.find(f => f.id === id),
    formsByUserId: (state, getters) => userId => getters.forms.filter(f => f.user.id === userId),
    // Legacy
    loadedForms (state) {
      return (formTemplateId) => {
        if (!state.loadedForms[formTemplateId]) {
          return []
        }

        return state.loadedForms[formTemplateId]
      }
    },
    loadedAllForms (state, getters, rootState) {
      return (slug) => {
        let forms = []
        const formTemplates = rootState.formTemplate.loadedFormTemplates[slug]
        if (!formTemplates) {
          return []
        }
        for (var i = 0; i < formTemplates.length; i++) {
          if (state.loadedForms[formTemplates[i].id]) {
            forms = forms.concat(state.loadedForms[formTemplates[i].id])
          }
        }
        return forms
      }
    },
    loadedApplicationForm (state, getters, rootState) {
      return (slug, formId) => {
        const formTemplates = rootState.formTemplate.loadedFormTemplates[slug]
        if (!formTemplates) {
          return null
        }
        for (var i = 0; i < formTemplates.length; i++) {
          if (state.loadedForms[formTemplates[i].id]) {
            const form = state.loadedForms[formTemplates[i].id].find((form) => {
              return form.id === formId
            })
            if (form) {
              return form
            }
          }
        }
        return null
      }
    },
    loadedForm (state) {
      return (formTemplateId, formId) => {
        if (!state.loadedForms[formTemplateId]) {
          return null
        }

        return state.loadedForms[formTemplateId].find((form) => {
          return form.id === formId
        })
      }
    },
    loadedFormOrganisations (state, getters, rootState) {
      return (slug, formTemplateId) => {
        if (!rootState.organisation.loadedOrganisations[slug]) {
          return []
        }

        let organisations = rootState.organisation.loadedOrganisations[slug].slice(0)
        organisations.push({id: 0, name: 'No Organisation'})
        const forms = state.loadedForms[formTemplateId]
        if (forms) {
          for (var i = 0; i < forms.length; i++) {
            organisations = organisations.filter((organisation) => {
              if (!forms[i].organisation) {
                return organisation.id !== 0
              } else {
                return forms[i].organisation.name !== organisation.name
              }
            })
          }
        }
        return organisations
      }
    }
  },
  mutations: {
    clearLoadedForms (state) {
      state.loadedForms = {}
    },
    setUserForms (state, payload) {
      let forms = { ...state.loadedForms }
      payload.forms.forEach(form => {
        const formTemplateForms = forms[form.form_template.id] || []
        const index = formTemplateForms.findIndex(f => f.id === form.id)
        index > -1 ? formTemplateForms.splice(index, 1, form) : formTemplateForms.push(form)
        forms[form.form_template.id] = formTemplateForms
      })
      state.loadedForms = forms
    },
    setForm (state, payload) {
      let forms = { ...state.loadedForms }
      const formTemplateForms = forms[payload.form.form_template.id] || []
      const index = formTemplateForms.findIndex(f => f.id === payload.form.id)
      index > -1 ? formTemplateForms.splice(index, 1, payload.form) : formTemplateForms.push(payload.form)
      forms[payload.form.form_template.id] = formTemplateForms
      state.loadedForms = forms
    },
    setLoadedForms (state, payload) {
      let forms = Object.assign({}, state.loadedForms)
      forms[payload.formTemplateId] = payload.forms
      state.loadedForms = forms
    },
    setLoadedAllForms (state, payload) {
      let forms = Object.assign({}, state.loadedForms)
      for (let i = 0; i < payload.forms.length; i++) {
        const form = payload.forms[i]
        forms[form.form_template.id] = []
      }
      for (let i = 0; i < payload.forms.length; i++) {
        const form = payload.forms[i]
        forms[form.form_template.id].push(form)
      }
      state.loadedForms = forms
    },
    createForm (state, payload) {
      let forms = Object.assign({}, state.loadedForms)
      if (!forms[payload.formTemplateId]) {
        forms[payload.formTemplateId] = []
      }
      forms[payload.formTemplateId].push(payload.form)
      state.loadedForms = forms
    },
    deleteForm (state, payload) {
      let forms = Object.assign({}, state.loadedForms)
      forms[payload.formTemplateId] = forms[payload.formTemplateId].filter(e => {
        return e.id !== payload.id
      })
      state.loadedForms = forms
    },
    setLoadedResponses (state, payload) {
      let forms = Object.assign({}, state.loadedForms)
      const form = forms[payload.formTemplateId].find((form) => {
        return form.id === payload.formId
      })
      form.responses = payload.responses
      state.loadedForms = forms
    },
    createResponse (state, payload) {
      let forms = Object.assign({}, state.loadedForms)
      const form = forms[payload.formTemplateId].find((form) => {
        return form.id === payload.formId
      })
      form.responses.push(payload.response)
      state.loadedForms = forms
    },
    updateResponse (state, payload) {
      let forms = Object.assign({}, state.loadedForms)
      const form = forms[payload.formTemplateId].find((form) => {
        return form.id === payload.formId
      })
      const index = form.responses.findIndex(response => {
        return response.id === payload.oldId
      })
      form.responses.splice(index, 1, payload.response)
      state.loadedForms = forms
    },
    deleteResponse (state, payload) {
      let forms = Object.assign({}, state.loadedForms)
      const form = forms[payload.formTemplateId].find((form) => {
        return form.id === payload.formId
      })
      form.responses = form.responses.filter(e => {
        return e.id !== payload.id
      })
      state.loadedForms = forms
    }
  },
  actions: {
    getUserForms ({ commit }, payload) {
      commit('setLoading', true)
      return new Promise((resolve, reject) => {
        window.axios.get(APPLICATION_URL + payload.slug + USER_URL + '/' + payload.user_id + FORMS_URL)
        .then(response => {
          const forms = { slug: payload.slug, forms: response['data']['forms'] }
          commit('setUserForms', forms)
          resolve(response)
        })
        .catch(error => {
          reject(error)
        })
        .finally(() => {
          commit('setLoading', false)
        })
      })
    },
    loadedForms ({commit}, payload) {
      commit('setLoading', true)
      const formTemplateId = payload.form_template_id ? payload.form_template_id : payload
      const params = payload.params ? payload.params : ''
      return new Promise((resolve, reject) => {
        window.axios.get(FORM_TEMPLATE_URL + formTemplateId + FORM_URL + params)
        .then(response => {
          const updateObj = {
            formTemplateId: formTemplateId,
            forms: response['data']['forms']
          }
          commit('setLoadedForms', updateObj)
          resolve(response)
        })
        .catch(error => {
          commit('setError', error.message)
        })
        .finally(() => {
          commit('setLoading', false)
        })
      })
    },
    getForm: async ({commit}, payload) => {
      try {
        commit('setLoading', true)
        const response = await window.axios.get(APPLICATION_URL + payload.slug + FORM_URL + '/' + payload.id)
        const form = {
          formTemplateId: response['data']['form']['form_template']['id'],
          form: response['data']['form']
        }
        commit('setForm', form)
        return response
      } catch (error) {
        commit('setError', error.message)
      } finally {
        commit('setLoading', false)
      }
    },
    loadAllForms ({commit}, payload) {
      commit('setLoading', true)
      const slug = payload.slug ? payload.slug : payload
      const params = payload.params ? payload.params : ''
      return new Promise((resolve, reject) => {
        window.axios.get(APPLICATION_URL + slug + FORM_URL + params)
          .then(
            response => {
              commit('setLoading', false)
              const updateObj = {
                forms: response['data']['forms']
              }
              commit('setLoadedAllForms', updateObj)
              resolve(response)
            }
          )
          .catch(
            error => {
              commit('setLoading', false)
              reject(error)
            }
          )
      })
    },
    createForm: async ({commit, getters}, payload) => {
      try {
        commit('setLoading', true)
        const response = await window.axios.post(FORM_TEMPLATE_URL + payload.form_template_id + FORM_URL, payload)
        const form = {
          formTemplateId: payload.form_template_id,
          form: response['data']['form']
        }
        commit('createForm', form)
        return response
      } catch (error) {
        commit('setError', error.message)
      } finally {
        commit('setLoading', false)
      }
    },
    updateForm ({commit}, payload) {
      commit('setLoading', true)

      let form = {
        organisation_id: payload.organisationId,
        user_id: payload.userId
      }

      if (payload.statusId) {
        form.status_id = payload.statusId
      }

      if (payload.periodStart) {
        form.period_start = payload.periodStart
      }

      if (payload.periodEnd) {
        form.period_end = payload.periodEnd
      }

      if (payload.progress !== undefined) {
        form.progress = parseInt(payload.progress)
      }

      return new Promise((resolve, reject) => {
        window.axios.put(FORM_TEMPLATE_URL + payload.formTemplateId + FORM_URL + '/' + payload.id, form)
          .then(
            response => {
              commit('setLoading', false)
              const updateObj = {
                formTemplateId: payload.formTemplateId,
                form: response['data']['form']
              }
              commit('setForm', updateObj)
              resolve(response)
            }
          )
          .catch(error => {
            console.log(error)
            commit('setLoading', false)
            reject(error)
          })
      })
    },
    duplicateForm ({commit}, payload) {
      commit('setLoading', true)
      return new Promise((resolve, reject) => {
        window.axios.post(FORM_TEMPLATE_URL + payload.formTemplateId + FORM_URL + '/' + payload.id)
          .then(
            response => {
              commit('setLoading', false)
              const createdObj = {
                formTemplateId: payload.formTemplateId,
                form: response['data']['form']
              }
              commit('createForm', createdObj)
              resolve(response)
            }
          )
          .catch(error => {
            console.log(error)
            commit('setLoading', false)
            reject(error)
          })
      })
    },
    deleteForm ({commit}, payload) {
      commit('setLoading', true)
      return new Promise((resolve, reject) => {
        window.axios.delete(FORM_TEMPLATE_URL + payload.formTemplateId + FORM_URL + '/' + payload.id)
          .then((response) => {
            commit('setLoading', false)
            commit('deleteForm', payload)
            resolve(response)
          })
          .catch(error => {
            console.log(error)
            commit('setLoading', false)
            reject(error)
          })
      })
    }
  }
}
