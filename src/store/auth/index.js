const API_URL = process.env.API_URL
const API_ORIGIN_URL = process.env.API_ORIGIN_URL
const REGISTER_URL = `${API_URL}register`
const LOGIN_URL = `${API_URL}login`
const LOGOUT_URL = `${API_URL}logout`
const USER_URL = `${API_URL}user`
const SOCIAL_URL = `${API_ORIGIN_URL}auth/signin`
const PASSWORD_RESET_URL = `${API_URL}password/reset`
const EMAIL_UPDATE_URL = `${API_URL}user/update-email`
const PASSWORD_UPDATE_URL = `${API_URL}user/update-password`

export default {
  state: {
    user: null
  },
  mutations: {
    setUser (state, payload) {
      state.user = payload
    }
  },
  actions: {
    signUserUp ({commit}, payload) {
      commit('setLoading', true)
      commit('clearError')
      return new Promise((resolve, reject) => {
        window.axios.post(REGISTER_URL, payload)
          .then((response) => {
            window.axios.post(LOGIN_URL, payload)
              .then(
                response => {
                  commit('setLoading', false)
                  const user = response['data']['user']
                  sessionStorage.setItem('token', user['api_token'])
                  commit('setUser', user)
                }
              )
              .catch(
                error => {
                  commit('setLoading', false)
                  commit('setUser', null)
                  if (typeof (error.response.data) !== 'string') {
                    commit('setError', error.response.data)
                  }
                }
              )
            resolve(response)
          })
          .catch((error) => {
            commit('setLoading', false)
            if (typeof (error.response.data) !== 'string') {
              commit('setError', error.response.data)
            }
            reject(error)
          })
      })
    },
    signUserIn ({commit}, payload) {
      commit('setLoading', true)
      commit('clearError')
      return new Promise((resolve, reject) => {
        window.axios.post(LOGIN_URL, payload)
          .then(
            response => {
              commit('setLoading', false)
              const user = response['data']['user']
              sessionStorage.setItem('token', user['api_token'])
              commit('setUser', user)
              resolve(response)
            }
          )
          .catch(
            error => {
              commit('setLoading', false)
              commit('setUser', null)
              if (typeof (error.response.data) !== 'string') {
                commit('setError', error.response.data)
              }
              reject(error)
            }
          )
      })
    },
    autoSignIn ({commit}) {
      commit('setLoading', true)
      commit('clearError')
      return new Promise((resolve, reject) => {
        window.axios.get(USER_URL)
          .then(
            (response) => {
              commit('setLoading', false)
              commit('setUser', response['data']['user'])
              resolve(response)
            }
          )
          .catch(
            (error) => {
              commit('setLoading', false)
              commit('setUser', null)
              reject(error)
            }
          )
      })
    },
    authSignIn ({commit}, payload) {
      commit('setLoading', true)
      commit('clearError')
      window.axios.post(SOCIAL_URL, payload)
        .then(
          response => {
            commit('setLoading', false)
            const user = response['data']['user']
            sessionStorage.setItem('token', user['api_token'])
            commit('setUser', user)
          }
        )
        .catch(
          error => {
            commit('setLoading', false)
            commit('setUser', null)
            if (typeof (error.response.data) !== 'string') {
              commit('setError', error.response.data)
            }
          }
        )
    },
    logout ({commit}) {
      commit('clearError')
      commit('setUser', null)
      window.axios.post(LOGOUT_URL)
        .then(response => {
          sessionStorage.removeItem('token')
          commit('clearUsers')
          commit('clearLoadedResourcceAccessSettings')
          commit('clearLoadedResourceAcl')
          commit('clearLoadedSections')
          commit('clearLoadedTriggers')
          commit('clearLoadedForms')
          commit('clearLoadedValidations')
          commit('clearLoadedFormTemplates')
          commit('clearLoadedOrganisations')
          commit('clearOrganisationUsers')
        })
    },
    updateAuth ({commit}, payload) {
      commit('setLoading', true)
      commit('clearError')
      const updateObj = {
        first_name: payload.first_name,
        last_name: payload.last_name
      }
      window.axios.put(USER_URL, updateObj)
        .then(response => {
          commit('setLoading', false)
          commit('setUser', response['data']['user'])
          commit('clearError')
        })
        .catch(error => {
          commit('setLoading', false)
          commit('setError', error.response.data)
        })
    },
    updateEmail ({commit}, payload) {
      commit('setLoading', true)
      commit('clearError')
      const updateObj = {
        email: payload.email,
        password: payload.password
      }
      window.axios.put(EMAIL_UPDATE_URL, updateObj)
        .then(response => {
          commit('setLoading', false)
          commit('setUser', response['data']['user'])
          commit('clearError')
        })
        .catch(error => {
          commit('setLoading', false)
          commit('setError', error.response.data)
        })
    },
    updatePassword ({commit}, payload) {
      commit('setLoading', true)
      commit('clearError')
      const updateObj = {
        old_password: payload.oldPassword,
        new_password: payload.newPassword
      }
      window.axios.put(PASSWORD_UPDATE_URL, updateObj)
        .then(response => {
          commit('setLoading', false)
          commit('clearError')
        })
        .catch(error => {
          commit('setLoading', false)
          commit('setError', error.response.data)
        })
    },
    resetPassword ({commit}, payload) {
      commit('setLoading', true)
      commit('clearError')
      let obj = {
        email: payload.email
      }
      if (payload.password) {
        obj.password = payload.password
        obj.password_confirmation = payload.password
      }
      let token = ''
      if (payload.token) {
        token = '/' + payload.token
        obj.token = payload.token
      }
      return new Promise((resolve, reject) => {
        window.axios.post(PASSWORD_RESET_URL + token, obj)
          .then(response => {
            commit('setLoading', false)
            commit('clearError')
            resolve(response)
          })
          .catch(error => {
            commit('setLoading', false)
            commit('setError', error.response.data)
            reject(error)
          })
      })
    },
    destroyUser ({commit}) {
      commit('clearError')
      window.axios.delete(USER_URL)
        .then(response => {
          commit('setUser', null)
          sessionStorage.removeItem('token')
        })
    }
  },
  getters: {
    user: state => state.user,
    userRole: (state, getters) => getters.user ? getters.user.role : null,
    userIsSuperAdmin: (state, getters) => getters.userRole && getters.userRole.label === 'Super Admin'
  }
}
