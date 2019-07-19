import * as _ from 'lodash'

import { generateResourceKey } from '../../util/resource'

const API_URL = process.env.API_URL
const ACL_URL = `${API_URL}acl`

export default {
  state: {
    userAcl: {},
    loadedResourceAcl: {}
  },
  mutations: {
    clearLoadedResourceAcl (state) {
      state.userAcl = {}
      state.loadedResourceAcl = {}
    },
    setLoadedUserAcl (state, {data}) {
      const groupedData = _.groupBy(data, 'ability')
      const normalisedData = _.mapValues(groupedData, (abilityGroup) => {
        return _.map(abilityGroup, (ability) => generateResourceKey(ability.resource_type, ability.resource_id))
      })
      state.userAcl = normalisedData
    },
    setLoadedResourceAcl (state, {resource, id, data}) {
      const normalisedData = _.mapValues(_.keyBy(data, 'ability'), ability => ability.users)
      state.loadedResourceAcl = _.merge(
        {},
        state.loadedResourceAcl,
        { [generateResourceKey(resource, id)]: normalisedData }
      )
    }
  },
  actions: {
    loadUserAcl ({commit}) {
      commit('setLoading', true)
      return new Promise((resolve, reject) => {
        window.axios.get(ACL_URL)
          .then(
            response => {
              commit('setLoading', false)
              const {data} = response.data
              const updateObj = {
                data: data
              }
              commit('setLoadedUserAcl', updateObj)
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
    loadResourceAcl ({commit}, {resource, id}) {
      commit('setLoading', true)
      return new Promise((resolve, reject) => {
        window.axios.get(`${ACL_URL}/${resource}/${id}`)
          .then(
            response => {
              commit('setLoading', false)
              const {data} = response.data
              const updateObj = {
                id: id,
                resource: resource,
                data: data
              }
              commit('setLoadedResourceAcl', updateObj)
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
    updateResourceAcl ({commit}, {resource, id, resourceAcl}) {
      commit('setLoading', true)
      const data = {
        users: resourceAcl
      }
      return new Promise((resolve, reject) => {
        window.axios.put(`${ACL_URL}/${resource}/${id}`, data)
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
  },
  getters: {
    userAcl: state => state.userAcl,
    resourceAcl (state) {
      return (resource, id, ability) => {
        return _.get(state.loadedResourceAcl, `${generateResourceKey(resource, id)}.${ability}`, null)
      }
    }
  }
}
