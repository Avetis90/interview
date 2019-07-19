const API_URL = process.env.API_URL
const APPLICATION_URL = `${API_URL}application/`
const USER_URL = `/user`

export default {
  state: {
    loadedUsers: {}
  },
  mutations: {
    clearUsers (state) {
      state.loadedUsers = {}
    },
    setLoadedUsers (state, payload) {
      let users = Object.assign({}, state.loadedUsers)
      users[payload.slug] = payload.users
      state.loadedUsers = users
    },
    updateUser (state, payload) {
      let users = Object.assign({}, state.loadedUsers)
      const index = users[payload.slug].findIndex(user => {
        return user.id === payload.user.id
      })
      users[payload.slug][index] = payload.user
      state.loadedUsers = users
    },
    deleteUser (state, payload) {
      let users = Object.assign({}, state.loadedUsers)
      users[payload.slug] = users[payload.slug].filter(e => {
        return e.id !== payload.id
      })
      state.loadedUsers = users
    }
  },
  actions: {
    loadUsers ({commit}, slug) {
      commit('setLoading', true)
      return new Promise((resolve, reject) => {
        window.axios.get(APPLICATION_URL + slug + USER_URL)
          .then(
            response => {
              commit('setLoading', false)
              const updateLoadedObj = {
                slug: slug,
                users: response.data.data
              }
              commit('setLoadedUsers', updateLoadedObj)
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
    updateUser ({commit}, payload) {
      commit('setLoading', true)
      return new Promise((resolve, reject) => {
        window.axios.put(APPLICATION_URL + payload.slug + USER_URL + '/' + payload.id, payload)
        .then(response => {
          const updateObj = {
            slug: payload.slug,
            user: response['data']['data']
          }
          commit('updateUser', updateObj)
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
    deleteUser ({commit}, payload) {
      commit('setLoading', true)
      return new Promise((resolve, reject) => {
        window.axios.delete(APPLICATION_URL + payload.slug + USER_URL + '/' + payload.id)
        .then(response => {
          commit('deleteUser', payload)
          resolve(response)
        })
        .catch(error => {
          reject(error)
        })
        .finally(() => {
          commit('setLoading', false)
        })
      })
    }
  },
  getters: {
    users: state => slug => state.loadedUsers[slug] ? state.loadedUsers[slug] : [],
    userById: (state, getters) => (slug, userId) => getters.users(slug).find(user => user.id === userId),
    userApplicationRole: (state, getters) => (slug, userId) => getters.userById(slug, userId) ? getters.userById(slug, userId).application_role.label : null,
    userIsAdmin: (state, getters) => (slug, userId) => getters.userApplicationRole(slug, userId) === 'Admin',
    invitedUsers: (state, getters) => slug => getters.users(slug).filter(user => user.status.label === 'Invited'),
    // Legacy
    loadedUsers (state) {
      return (slug) => {
        if (!state.loadedUsers[slug]) {
          return []
        }
        return state.loadedUsers[slug]
      }
    },
    loadedFormUsers (state) {
      return (slug) => {
        if (!state.loadedUsers[slug]) {
          return []
        }
        return state.loadedUsers[slug].map((user) => {
          const userWithName = user
          userWithName.name = user.first_name + ' ' + user.last_name
          return userWithName
        })
      }
    },
    loadedUser (state) {
      return (slug, userId) => {
        if (!state.loadedUsers[slug]) {
          return null
        }
        return state.loadedUsers[slug].find((user) => {
          return user.id === userId
        })
      }
    }
  }
}
