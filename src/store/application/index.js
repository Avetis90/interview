const API_URL = process.env.API_URL
const APPLICATION_URL = `${API_URL}application`
const USER_URL = `/user`

export default {
  state: {
    loadedApplications: []
  },
  mutations: {
    setLoadedApplication (state, payload) {
      const index = state.loadedApplications.findIndex(application => {
        return application.id === payload.id
      })
      if (index !== -1) {
        state.loadedApplications.splice(index, 1, payload)
      } else {
        state.loadedApplications.push(payload)
      }
    },
    setLoadedApplications (state, payload) {
      state.loadedApplications = payload
    },
    createApplication (state, payload) {
      state.loadedApplications.push(payload)
    },
    updateApplication (state, payload) {
      const index = state.loadedApplications.findIndex(application => {
        return application.slug === payload.slug
      })
      state.loadedApplications.splice(index, 1, payload.application)
    },
    deleteApplication (state, payload) {
      state.loadedApplications = state.loadedApplications.filter(e => {
        return e.slug !== payload.slug
      })
    }
  },
  actions: {
    loadApplication ({commit}, slug) {
      commit('setLoading', true)
      return new Promise((resolve, reject) => {
        window.axios.get(APPLICATION_URL + '/' + slug)
          .then(
            response => {
              commit('setLoading', false)
              commit('setLoadedApplication', response['data']['application'])
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
    loadApplications ({commit}) {
      commit('setLoading', true)
      window.axios.get(APPLICATION_URL)
        .then(
          response => {
            commit('setLoading', false)
            commit('setLoadedApplications', response['data']['applications'])
          }
        )
        .catch(
          error => {
            commit('setLoading', false)
            console.log(error)
          }
        )
    },
    createApplication ({commit, getters}, payload) {
      const application = {
        name: payload.name
      }
      commit('setLoading', true)
      return new Promise((resolve, reject) => {
        window.axios.post(APPLICATION_URL, application)
          .then(
            response => {
              commit('setLoading', false)
              commit('createApplication', response['data']['application'])
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
    inviteApplication ({commit, getters}, payload) {
      commit('setLoading', true)
      const application = {
        invitations: payload.invitations,
        role_id: payload.role_id,
        form_templates: payload.form_templates,
        subject: payload.subject,
        cc: payload.cc,
        bcc: payload.bcc,
        message: payload.message
      }
      window.axios.post(APPLICATION_URL + '/' + payload.slug + '/invite', application)
        .then(
          response => {
            window.axios.get(APPLICATION_URL + '/' + payload.slug + USER_URL)
              .then(
                response => {
                  commit('setLoading', false)
                  const updateLoadedObj = {
                    slug: payload.slug,
                    users: response['data']['users']['current']
                  }
                  commit('setLoadedUsers', updateLoadedObj)

                  const updateInvitedObj = {
                    slug: payload.slug,
                    users: response['data']['users']['unaccepted']
                  }
                  commit('setInvitedUsers', updateInvitedObj)
                }
              )
              .catch(
                error => {
                  commit('setLoading', false)
                  console.log(error)
                }
              )
          }
        )
        .catch(
          error => {
            commit('setLoading', false)
            console.log(error)
          }
        )
    },
    updateApplication ({commit}, payload) {
      commit('setLoading', true)
      const application = {
        name: payload.name,
        css: payload.css,
        support_text: payload.supportText,
        join_flag: payload.joinFlag,
        icon: payload.icon,
        logo: payload.logo,
        background_image: payload.background_image,
        default_route: payload.default_route
      }

      return new Promise((resolve, reject) => {
        window.axios.put(APPLICATION_URL + '/' + payload.slug, application)
          .then(response => {
            commit('setLoading', false)
            const updateObject = {
              slug: payload.slug,
              application: response['data']['application']
            }
            commit('updateApplication', updateObject)
            resolve(response)
          })
          .catch(error => {
            commit('setLoading', false)
            reject(error)
          })
      })
    },
    deleteApplication ({commit}, payload) {
      commit('setLoading', true)
      window.axios.delete(APPLICATION_URL + '/' + payload.slug)
        .then(() => {
          commit('setLoading', false)
          commit('deleteApplication', payload)
        })
        .catch(error => {
          console.log(error)
          commit('setLoading', false)
        })
    }
  },
  getters: {
    applications: (state) => state.loadedApplications,
    applicationBySlug: (state, getters) => (slug) => {
      return getters.applications.find(application => application.slug === slug)
    },
    applicationById: (state, getters) => (applicationId) => {
      return getters.applications.find(application => application.id === applicationId)
    },
    // Legacy
    loadedApplications (state) {
      return state.loadedApplications.sort((applicationA, applicationB) => {
        return applicationA.name > applicationB.name
      })
    },
    loadedApplication (state) {
      return (slug) => {
        return state.loadedApplications.find((application) => {
          return application.slug === slug
        })
      }
    },
    loadedApplicationById (state) {
      return (applicationId) => {
        return state.loadedApplications.find((application) => {
          return application.id === applicationId
        })
      }
    }
  }
}
