import * as _ from 'lodash'

const API_URL = process.env.API_URL
const APPLICATION_URL = `${API_URL}application/`
const ORGANISATION_URL = `/organisation/`
const USER_URL = `/user`
const INVITED_USER_URL = `/invited/`

export default {
  state: {
    loadedOrganisationUsers: {},
    invitedOrganisationUsers: {}
  },
  mutations: {
    clearOrganisationUsers (state) {
      state.loadedOrganisationUsers = {}
      state.invitedOrganisationUsers = {}
    },
    setLoadedOrganisationUsers (state, payload) {
      let users = Object.assign({}, state.loadedOrganisationUsers)
      users[payload.organisationId] = payload.users
      state.loadedOrganisationUsers = users
    },
    setInvitedOrganisationUsers (state, payload) {
      let users = Object.assign({}, state.invitedOrganisationUsers)
      users[payload.organisationId] = payload.users
      state.invitedOrganisationUsers = users
    },
    updateOrganisationUser (state, payload) {
      let users = Object.assign({}, state.loadedOrganisationUsers)
      const index = users[payload.organisationId].findIndex(user => {
        return user.id === payload.user.user_id
      })
      users[payload.organisationId][index].organisation_role_id = payload.user.organisation_role_id
      state.loadedOrganisationUsers = users
    },
    deleteOrganisationUser (state, payload) {
      let users = Object.assign({}, state.loadedOrganisationUsers)
      users[payload.organisationId] = users[payload.organisationId].filter(e => {
        return e.id !== payload.id
      })
      state.loadedOrganisationUsers = users
    },
    updateInvitedOrganisationUser (state, payload) {
      let users = Object.assign({}, state.invitedOrganisationUsers)
      const index = users[payload.organisationId].findIndex(user => {
        return user.id === payload.user.id
      })
      users[payload.organisationId][index].organisation_role_id = payload.user.organisation_role_id
      state.invitedOrganisationUsers = users
    },
    deleteInvitedOrganisationUser (state, payload) {
      let users = Object.assign({}, state.invitedOrganisationUsers)
      users[payload.organisationId] = users[payload.organisationId].filter(e => {
        return e.id !== payload.id
      })
      state.invitedOrganisationUsers = users
    }
  },
  actions: {
    loadAllOrganisationUsers ({commit}, slug) {
      commit('setLoading', true)
      return new Promise((resolve, reject) => {
        window.axios.get(APPLICATION_URL + slug + ORGANISATION_URL + 'user')
          .then(
            response => {
              commit('setLoading', false)
              _.forEach(response['data']['users'], (users, index) => {
                const updateLoadedObj = {
                  organisationId: users['organisation_id'],
                  users: users['current']
                }
                commit('setLoadedOrganisationUsers', updateLoadedObj)

                const updateInvitedObj = {
                  organisationId: users['organisation_id'],
                  users: users['unaccepted']
                }
                commit('setInvitedOrganisationUsers', updateInvitedObj)
              })

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
    loadOrganisationUsers ({commit}, payload) {
      commit('setLoading', true)
      window.axios.get(APPLICATION_URL + payload.slug + ORGANISATION_URL + payload.organisationId + USER_URL)
        .then(
          response => {
            commit('setLoading', false)
            const updateLoadedObj = {
              organisationId: payload.organisationId,
              users: response['data']['users']['current']
            }
            commit('setLoadedOrganisationUsers', updateLoadedObj)

            const updateInvitedObj = {
              organisationId: payload.organisationId,
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
    },
    updateOrganisationUser ({commit}, payload) {
      commit('setLoading', true)
      const updateObj = {}
      if (payload.organisationRoleId) {
        updateObj.organisation_role_id = payload.organisationRoleId
      }
      window.axios.put(APPLICATION_URL + payload.slug + ORGANISATION_URL + payload.organisationId + USER_URL + '/' + payload.id, updateObj)
        .then(
          response => {
            commit('setLoading', false)
            const updateObj = {
              organisationId: payload.organisationId,
              user: response['data']['user']
            }
            commit('updateOrganisationUser', updateObj)
          }
        )
        .catch(error => {
          console.log(error)
          commit('setLoading', false)
        })
    },
    deleteOrganisationUser ({commit}, payload) {
      commit('setLoading', true)
      window.axios.delete(APPLICATION_URL + payload.slug + ORGANISATION_URL + payload.organisationId + USER_URL + '/' + payload.id)
        .then(() => {
          commit('setLoading', false)
          commit('deleteOrganisationUser', payload)
        })
        .catch(error => {
          console.log(error)
          commit('setLoading', false)
        })
    },
    updateInvitedOrganisationUser ({commit}, payload) {
      commit('setLoading', true)
      const updateObj = {}
      if (payload.roleId) {
        updateObj.organisation_role_id = payload.roleId
      }
      window.axios.put(APPLICATION_URL + payload.slug + ORGANISATION_URL + payload.organisationId + INVITED_USER_URL + payload.id, updateObj)
        .then(
          response => {
            commit('setLoading', false)
            const updateObj = {
              organisationId: payload.organisationId,
              user: response['data']['user']
            }
            commit('updateInvitedOrganisationUser', updateObj)
          }
        )
        .catch(error => {
          console.log(error)
          commit('setLoading', false)
        })
    },
    deleteInvitedOrganisationUser ({commit}, payload) {
      commit('setLoading', true)
      window.axios.delete(APPLICATION_URL + payload.slug + ORGANISATION_URL + payload.organisationId + INVITED_USER_URL + payload.id)
        .then(() => {
          commit('setLoading', false)
          commit('deleteInvitedOrganisationUser', payload)
        })
        .catch(error => {
          console.log(error)
          commit('setLoading', false)
        })
    }
  },
  getters: {
    loadedOrganisationUsers (state) {
      return (organisationId) => {
        if (!state.loadedOrganisationUsers[organisationId]) {
          return []
        }
        return state.loadedOrganisationUsers[organisationId].sort((userA, userB) => {
          return userA.id > userB.id
        })
      }
    },
    loadedFormOrganisationUsers (state) {
      return (organisationId) => {
        if (!state.loadedOrganisationUsers[organisationId]) {
          return []
        }
        return state.loadedOrganisationUsers[organisationId].map((user) => {
          const userWithName = user
          userWithName.name = user.first_name + ' ' + user.last_name
          return userWithName
        })
      }
    },
    invitedOrganisationUsers (state) {
      return (organisationId) => {
        if (!state.invitedOrganisationUsers[organisationId]) {
          return []
        }
        return state.invitedOrganisationUsers[organisationId].sort((userA, userB) => {
          return userA.id > userB.id
        })
      }
    },
    loadedOrganisationUser (state) {
      return (organisationId, userId) => {
        if (!state.loadedOrganisationUsers[organisationId]) {
          return null
        }
        return state.loadedOrganisationUsers[organisationId].find((user) => {
          return user.id === userId
        })
      }
    }
  }
}
