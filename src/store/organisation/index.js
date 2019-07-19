const API_URL = process.env.API_URL
const APPLICATION_URL = `${API_URL}application/`
const ORGANISATION_URL = `/organisation`
const USER_URL = `/user`

export default {
  state: {
    loadedOrganisations: {}
  },
  mutations: {
    clearLoadedOrganisations (state) {
      state.loadedOrganisations = {}
    },
    setLoadedOrganisations (state, payload) {
      let organisations = Object.assign({}, state.loadedOrganisations)
      organisations[payload.slug] = payload.organisations
      state.loadedOrganisations = organisations
    },
    createOrganisation (state, payload) {
      let organisations = Object.assign({}, state.loadedOrganisations)
      if (!organisations[payload.slug]) {
        organisations[payload.slug] = []
      }
      organisations[payload.slug].push(payload.organisation)
      state.loadedOrganisations = organisations
    },
    updateOrganisation (state, payload) {
      let organisations = Object.assign({}, state.loadedOrganisations)
      const index = organisations[payload.slug].findIndex(organisation => {
        return organisation.id === payload.organisation.id
      })
      organisations[payload.slug].splice(index, 1, payload.organisation)
      state.loadedOrganisations = organisations
    },
    deleteOrganisation (state, payload) {
      let organisations = Object.assign({}, state.loadedOrganisations)
      organisations[payload.slug] = organisations[payload.slug].filter(e => {
        return e.id !== payload.id
      })
      state.loadedOrganisations = organisations
    }
  },
  actions: {
    loadOrganisations ({commit}, slug) {
      commit('setLoading', true)
      return new Promise((resolve, reject) => {
        window.axios.get(APPLICATION_URL + slug + ORGANISATION_URL)
          .then(
            response => {
              commit('setLoading', false)
              const updateObj = {
                slug: slug,
                organisations: response['data']['organisations']
              }
              commit('setLoadedOrganisations', updateObj)

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
    createOrganisation ({commit, getters}, payload) {
      commit('setLoading', true)
      const organisation = {
        name: payload.name,
        role: payload.role
      }
      return new Promise((resolve, reject) => {
        window.axios.post(APPLICATION_URL + payload.slug + ORGANISATION_URL, organisation)
          .then(
            response => {
              commit('setLoading', false)
              const createObj = {
                slug: payload.slug,
                organisation: response['data']['organisation']
              }
              commit('createOrganisation', createObj)
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
    inviteOrganisation ({commit, getters}, payload) {
      commit('setLoading', true)
      const organisation = {
        invitations: payload.invitations,
        role_id: payload.role_id,
        subject: payload.subject,
        cc: payload.cc,
        bcc: payload.bcc,
        message: payload.message
      }
      window.axios.post(APPLICATION_URL + payload.slug + ORGANISATION_URL + '/' + payload.id + '/invite', organisation)
        .then(
          response => {
            window.axios.get(APPLICATION_URL + payload.slug + ORGANISATION_URL + '/' + payload.id + USER_URL)
              .then(
                response => {
                  commit('setLoading', false)
                  const updateLoadedObj = {
                    organisationId: payload.id,
                    users: response['data']['users']['current']
                  }
                  commit('setLoadedOrganisationUsers', updateLoadedObj)

                  const updateInvitedObj = {
                    organisationId: payload.id,
                    users: response['data']['users']['unaccepted']
                  }
                  commit('setInvitedOrganisationUsers', updateInvitedObj)
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
    updateOrganisation ({commit}, payload) {
      commit('setLoading', true)
      const updateObj = {}
      if (payload.name) {
        updateObj.name = payload.name
      }
      window.axios.put(APPLICATION_URL + payload.slug + ORGANISATION_URL + '/' + payload.id, updateObj)
        .then(
          response => {
            commit('setLoading', false)
            const updateObj = {
              slug: payload.slug,
              organisation: response['data']['organisation']
            }
            commit('updateOrganisation', updateObj)
          }
        )
        .catch(error => {
          console.log(error)
          commit('setLoading', false)
        })
    },
    deleteOrganisation ({commit}, payload) {
      commit('setLoading', true)
      window.axios.delete(APPLICATION_URL + payload.slug + ORGANISATION_URL + '/' + payload.id)
        .then(() => {
          commit('setLoading', false)
          commit('deleteOrganisation', payload)
        })
        .catch(error => {
          console.log(error)
          commit('setLoading', false)
        })
    }
  },
  getters: {
    organisations: state => slug => state.loadedOrganisations[slug] || [],
    organisationById: (state, getters) => (slug, id) => getters.organisations(slug).find(o => o.id === id),
    // Legacy
    loadedOrganisations (state) {
      return (slug) => {
        if (!state.loadedOrganisations[slug]) {
          return []
        }
        return state.loadedOrganisations[slug]
      }
    },
    loadedOrganisation (state) {
      return (slug, organisationId) => {
        if (!state.loadedOrganisations[slug]) {
          return null
        }
        return state.loadedOrganisations[slug].find((organisation) => {
          return organisation.id === organisationId
        })
      }
    }
  }
}
