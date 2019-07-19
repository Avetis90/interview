import { generateResourceKey } from '../../util/resource'

const API_URL = process.env.API_URL
const ACCESS_SETTINGS_URL = `${API_URL}access-settings`

export default {
  state: {
    loadedResourceAccessSettings: {}
  },
  mutations: {
    clearLoadedResourcceAccessSettings (state) {
      state.loadedResourceAccessSettings = {}
    },
    setLoadedResourceAccessSettings (state, {resource, accessLevel, id}) {
      state.loadedResourceAccessSettings = {
        ...state.loadedResourceAccessSettings,
        [generateResourceKey(resource, id)]: accessLevel
      }
    }
  },
  actions: {
    loadResourceAccessSettings ({commit}, {resource, id}) {
      commit('setLoading', true)
      return new Promise((resolve, reject) => {
        window.axios.get(`${ACCESS_SETTINGS_URL}/${resource}/${id}`)
          .then(
            response => {
              commit('setLoading', false)
              const updateObj = {
                id: id,
                resource: resource,
                accessLevel: response.data.data.access_level
              }
              commit('setLoadedResourceAccessSettings', updateObj)
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
    updateResourceAccessSettings ({commit}, {resource, id, accessLevel}) {
      commit('setLoading', true)
      const data = {
        access_level: accessLevel
      }
      return new Promise((resolve, reject) => {
        window.axios.put(`${ACCESS_SETTINGS_URL}/${resource}/${id}`, data)
          .then(
            response => {
              commit('setLoading', false)
              const updateObj = {
                id: id,
                resource: resource,
                accessLevel: response.data.data.access_level
              }
              commit('setLoadedResourceAccessSettings', updateObj)
              resolve(response)
            }
          )
          .catch(error => {
            console.log(error)
            commit('setLoading', false)
            reject(error)
          })
      })
    }
  },
  getters: {
    loadedResourceAccessSettings (state) {
      return (resource, id) => {
        const key = generateResourceKey(resource, id)
        if (!state.loadedResourceAccessSettings[key]) {
          return null
        }
        return state.loadedResourceAccessSettings[key]
      }
    }
  }
}
