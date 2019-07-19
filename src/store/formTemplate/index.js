const API_URL = process.env.API_URL
const APPLICATION_URL = `${API_URL}application/`
const FORM_TEMPLATE_URL = `/form-templates`
const FORM_TEMPLATE = `/form-template`
const SETTING_URL = `auto`

export default {
  state: {
    loadedFormTemplates: {}
  },
  getters: {
    formTemplates: state => slug => state.loadedFormTemplates[slug] ? state.loadedFormTemplates[slug] : [],
    formTemplateById: (state, getters) => (slug, id) => getters.formTemplates(slug).find(ft => ft.id === id),
    formTemplateByName: (state, getters) => (slug, name) => getters.formTemplates(slug).find(ft => ft.name === name),
    // Legacy
    loadedFormTemplates (state) {
      return (slug) => {
        if (!state.loadedFormTemplates[slug]) {
          return []
        }
        return state.loadedFormTemplates[slug]
      }
    },
    loadedFormTemplate (state) {
      return (slug, formTemplateId) => {
        if (!state.loadedFormTemplates[slug]) {
          return null
        }
        return state.loadedFormTemplates[slug].find((formTemplate) => {
          return formTemplate.id === formTemplateId
        })
      }
    }
  },
  mutations: {
    clearLoadedFormTemplates (state) {
      state.loadedFormTemplates = {}
    },
    setFormTemplate (state, payload) {
      let formTemplates = { ...state.loadedFormTemplates }
      const index = formTemplates[payload.slug].findIndex(ft => ft.id === payload.formTemplate.id)
      index > -1 ? formTemplates[payload.slug].splice(index, 1, payload.formTemplate) : formTemplates[payload.slug].push(payload.formTemplate)
      state.loadedFormTemplates = formTemplates
    },
    setLoadedFormTemplates (state, payload) {
      let formTemplates = Object.assign({}, state.loadedFormTemplates)
      formTemplates[payload.slug] = payload.formTemplates
      state.loadedFormTemplates = formTemplates
    },
    createFormTemplate (state, payload) {
      let formTemplates = Object.assign({}, state.loadedFormTemplates)
      if (!formTemplates[payload.slug]) {
        formTemplates[payload.slug] = []
      }
      formTemplates[payload.slug].push(payload.formTemplate)
      state.loadedFormTemplates = formTemplates
    },
    deleteFormTemplate (state, payload) {
      let formTemplates = Object.assign({}, state.loadedFormTemplates)
      formTemplates[payload.slug] = formTemplates[payload.slug].filter(e => {
        return e.id !== payload.id
      })
      state.loadedFormTemplates = formTemplates
    },
    setAuto (state, payload) {
      let formTemplates = Object.assign({}, state.loadedFormTemplates)
      for (let i = 0; i < formTemplates[payload.slug].length; i++) {
        if (payload.formTemplateIds.includes(formTemplates[payload.slug][i].id)) {
          formTemplates[payload.slug][i].auto = 1
        } else {
          formTemplates[payload.slug][i].auto = 0
        }
      }
      state.loadedFormTemplates = formTemplates
    }
  },
  actions: {
    getFormTemplate: async ({commit}, payload) => {
      try {
        commit('setLoading', true)
        const response = await window.axios.get(APPLICATION_URL + payload.slug + FORM_TEMPLATE + '/' + payload.id)
        const formTemplate = {
          slug: payload.slug,
          formTemplate: response.data.form_template
        }
        commit('setFormTemplate', formTemplate)
        return response
      } catch (error) {
        commit('setError', error.message)
      } finally {
        commit('setLoading', false)
      }
    },
    loadFormTemplates: async ({commit}, slug) => {
      try {
        commit('setLoading', true)
        const response = await window.axios.get(APPLICATION_URL + slug + FORM_TEMPLATE_URL)
        const updateObj = {
          slug: slug,
          formTemplates: response.data.form_templates
        }
        commit('setLoadedFormTemplates', updateObj)
      } catch (error) {
        commit('setError', error.message)
      } finally {
        commit('setLoading', false)
      }
    },
    createFormTemplate ({commit, getters}, payload) {
      commit('setLoading', true)
      const formTemplate = {
        name: payload.name
      }

      if (payload.typeId) {
        formTemplate.type_id = payload.typeId
      }
      return new Promise((resolve, reject) => {
        window.axios.post(APPLICATION_URL + payload.slug + FORM_TEMPLATE_URL, formTemplate)
          .then(
            response => {
              commit('setLoading', false)
              const createObj = {
                slug: payload.slug,
                formTemplate: response['data']['form_template']
              }
              commit('createFormTemplate', createObj)
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
    duplicateFormTemplate ({commit, getters}, payload) {
      commit('setLoading', true)
      const formTemplate = {
        name: payload.name
      }
      return new Promise((resolve, reject) => {
        window.axios.post(APPLICATION_URL + payload.slug + FORM_TEMPLATE_URL + '/' + payload.id + '/duplicate', formTemplate)
          .then(
            response => {
              commit('setLoading', false)
              const createObj = {
                slug: payload.slug,
                formTemplate: response['data']['form_template']
              }
              commit('createFormTemplate', createObj)
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
    updateFormTemplate ({commit}, payload) {
      commit('setLoading', true)
      let formData = new FormData()

      if (payload.name) {
        formData.append('name', payload.name)
      }
      if (payload.typeId) {
        formData.append('type_id', payload.typeId)
      }
      if (payload.statusId) {
        formData.append('status_id', payload.statusId)
      }
      if (payload.showProgress !== null) {
        formData.append('show_progress', payload.showProgress ? 1 : 0)
      }

      if (payload.csv) {
        formData.append('csv', payload.csv)
      }

      const config = {
        headers: {'content-type': 'multipart/form-data'}
      }

      return new Promise((resolve, reject) => {
        window.axios.post(APPLICATION_URL + payload.slug + FORM_TEMPLATE_URL + '/' + payload.id, formData, config)
          .then(
            response => {
              commit('setLoading', false)
              const updateObj = {
                slug: payload.slug,
                formTemplate: response['data']['form_template']
              }
              commit('setFormTemplate', updateObj)
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
    uploadFormTemplate ({commit}, payload) {
      commit('setLoading', true)
      let formData = new FormData()
      formData.append('csv', payload.file)

      const config = {
        headers: {'content-type': 'multipart/form-data'}
      }
      return new Promise((resolve, reject) => {
        window.axios.post(APPLICATION_URL + payload.slug + FORM_TEMPLATE_URL + '/' + payload.id + '/upload', formData, config)
          .then(
            response => {
              commit('setLoading', false)
              resolve(response)
            }
          )
          .catch(error => {
            commit('setLoading', false)
            reject(error)
          })
      })
    },
    uploadFormData ({commit}, payload) {
      commit('setLoading', true)
      let formData = new FormData()
      formData.append('file', payload.file)
      formData.append('where', payload.where)
      formData.append('method', payload.method)

      const config = {
        headers: {'content-type': 'multipart/form-data'}
      }
      return new Promise((resolve, reject) => {
        window.axios.post(APPLICATION_URL + payload.slug + FORM_TEMPLATE_URL + '/' + payload.id + '/form/upload', formData, config)
          .then(
            response => {
              commit('setLoading', false)
              resolve(response)
            }
          )
          .catch(error => {
            commit('setLoading', false)
            reject(error)
          })
      })
    },
    uploadApplicationFormData ({commit}, payload) {
      commit('setLoading', true)
      let formData = new FormData()
      formData.append('file', payload.file)

      const config = {
        headers: {'content-type': 'multipart/form-data'}
      }
      return new Promise((resolve, reject) => {
        window.axios.post(APPLICATION_URL + payload.slug + '/form/upload', formData, config)
          .then(
            response => {
              commit('setLoading', false)
              resolve(response)
            }
          )
          .catch(error => {
            commit('setLoading', false)
            reject(error)
          })
      })
    },
    deleteFormTemplate ({commit}, payload) {
      commit('setLoading', true)
      window.axios.delete(APPLICATION_URL + payload.slug + FORM_TEMPLATE_URL + '/' + payload.id)
        .then(() => {
          commit('setLoading', false)
          commit('deleteFormTemplate', payload)
        })
        .catch(error => {
          console.log(error)
          commit('setLoading', false)
        })
    },
    setAuto ({commit}, payload) {
      commit('setLoading', true)
      const updateObj = {
        form_template_ids: payload.formTemplateIds
      }
      window.axios.post(APPLICATION_URL + payload.slug + FORM_TEMPLATE_URL + '/' + SETTING_URL, updateObj)
        .then(
          response => {
            commit('setLoading', false)
            const updateObj = {
              slug: payload.slug,
              formTemplateIds: payload.formTemplateIds
            }
            commit('setAuto', updateObj)
          }
        )
        .catch(
          error => {
            console.log(error)
            commit('setLoading', false)
          }
        )
    }
  }
}
