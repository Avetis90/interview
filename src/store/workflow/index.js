const API_URL = process.env.API_URL
const APPLICATION_URL = `${API_URL}application/`
const WORKFLOW_URL = `/workflow`

export default {
  state: {
    workflows: {}
  },
  mutations: {
    clearWorkflows (state) {
      state.workflows = {}
    },
    setWorkflows (state, payload) {
      let workflows = Object.assign({}, state.workflows)
      workflows[payload.slug] = payload.workflows
      state.workflows = workflows
    },
    createWorkflow (state, payload) {
      let workflows = Object.assign({}, state.workflows)
      if (!workflows[payload.slug]) {
        workflows[payload.slug] = []
      }
      workflows[payload.slug].push(payload.workflow)
      state.workflows = workflows
    },
    updateWorkflow (state, payload) {
      let workflows = Object.assign({}, state.workflows)
      const index = workflows[payload.slug].findIndex(workflow => {
        return workflow.id === payload.workflow.id
      })
      workflows[payload.slug].splice(index, 1, payload.workflow)
      state.workflows = workflows
    },
    deleteWorkflow (state, payload) {
      let workflows = Object.assign({}, state.workflows)
      workflows[payload.slug] = workflows[payload.slug].filter(e => {
        return e.id !== payload.id
      })
      state.workflows = workflows
    }
  },
  actions: {
    loadWorkflows ({commit}, slug) {
      commit('setLoading', true)
      return new Promise((resolve, reject) => {
        window.axios.get(APPLICATION_URL + slug + WORKFLOW_URL)
          .then(
            response => {
              commit('setLoading', false)
              const updateObj = {
                slug: slug,
                workflows: response['data']['data']
              }
              commit('setWorkflows', updateObj)
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
    createWorkflow ({commit, getters}, payload) {
      commit('setLoading', true)
      return new Promise((resolve, reject) => {
        window.axios.post(APPLICATION_URL + payload.slug + WORKFLOW_URL, payload)
          .then(
            response => {
              commit('setLoading', false)
              const createObj = {
                slug: payload.slug,
                workflow: response['data']['data']
              }
              commit('createWorkflow', createObj)
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
    updateWorkflow ({commit}, payload) {
      commit('setLoading', true)
      return new Promise((resolve, reject) => {
        window.axios.put(APPLICATION_URL + payload.slug + WORKFLOW_URL + '/' + payload.id, payload)
          .then(
            response => {
              commit('setLoading', false)
              const updateObj = {
                slug: payload.slug,
                workflow: response['data']['data']
              }
              commit('updateWorkflow', updateObj)
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
    deleteWorkflow ({commit}, payload) {
      commit('setLoading', true)
      return new Promise((resolve, reject) => {
        window.axios.delete(APPLICATION_URL + payload.slug + WORKFLOW_URL + '/' + payload.id)
          .then(response => {
            commit('setLoading', false)
            commit('deleteWorkflow', payload)
            resolve(response)
          })
          .catch(error => {
            console.log(error)
            commit('setLoading', false)
            reject(error)
          })
      })
    }
  },
  getters: {
    workflows (state) {
      return (slug) => {
        if (!state.workflows[slug]) {
          return []
        }
        return state.workflows[slug].sort((a, b) => {
          return a.id > b.id
        })
      }
    },
    workflow (state) {
      return (slug, workflowId) => {
        if (!state.workflows[slug]) {
          return null
        }
        return state.workflows[slug].find((workflow) => {
          return workflow.id === workflowId
        })
      }
    }
  }
}
