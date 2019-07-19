const API_URL = process.env.API_URL
const META_URL = `${API_URL}meta`

export default {
  actions: {
    createMeta ({commit, getters}, payload) {
      const meta = {
        metadata: payload.metadata,
        metable_id: payload.metableId,
        metable_type: payload.metableType
      }
      return new Promise((resolve, reject) => {
        window.axios.post(META_URL, meta)
          .then(
            response => {
              commit('setLoading', false)
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
    updateMeta ({commit}, payload) {
      commit('setLoading', true)
      const meta = {
        metadata: payload.metadata,
        metable_id: payload.metableId,
        metable_type: payload.metableType
      }
      return new Promise((resolve, reject) => {
        window.axios.put(META_URL + '/' + payload.id, meta)
          .then(
            response => {
              commit('setLoading', false)
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
    deleteMeta ({commit}, payload) {
      commit('setLoading', true)
      return new Promise((resolve, reject) => {
        window.axios.delete(META_URL + '/' + payload.id)
          .then(
            response => {
              commit('setLoading', false)
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
  }
}
