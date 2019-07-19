const API_URL = process.env.API_URL
const APPLICATION_URL = `${API_URL}application/`
const NOTE_URL = `/notes`

export default {
  state: {
    notes: {},
    noteTypes: [
      { id: 1, type: 'Phone' },
      { id: 2, type: 'Email' },
      { id: 4, type: 'Meeting' },
      { id: 3, type: 'Other' }
    ]
  },
  getters: {
    notes: (state) => (slug) => {
      return state.notes[slug] ? state.notes[slug] : []
    },
    notesByUserId: (state, getters) => (slug, userId) => {
      return getters.notes(slug).filter(note => note.user.id === userId)
    },
    noteById: (state, getters) => (slug, id) => {
      return getters.notes(slug).find(note => note.id === id)
    },
    noteTypes: (state) => {
      return state.noteTypes
    },
    noteTypeById: (state, getters) => (noteTypeId) => {
      return getters.noteTypes.find(noteType => noteType.id === noteTypeId)
    }
  },
  mutations: {
    setNotes (state, payload) {
      let notes = { ...{}, ...state.notes }
      notes[payload.slug] = payload.notes
      state.notes = notes
    },
    addNote (state, payload) {
      let notes = { ...{}, ...state.notes }
      notes[payload.slug] = notes[payload.slug] || []
      notes[payload.slug].push(payload.note)
      state.notes = notes
    },
    updateNote (state, payload) {
      let notes = { ...{}, ...state.notes }
      const index = notes[payload.slug].findIndex(note => note.id === payload.note.id)
      notes[payload.slug].splice(index, 1, payload.note)
      state.notes = notes
    },
    deleteNote (state, payload) {
      let notes = { ...{}, ...state.notes }
      const index = notes[payload.slug].findIndex(note => note.id === payload.id)
      notes[payload.slug].splice(index, 1)
      state.notes = notes
    }
  },
  actions: {
    getNotes ({ commit }, slug) {
      commit('setLoading', true)
      return new Promise((resolve, reject) => {
        window.axios.get(APPLICATION_URL + slug + NOTE_URL)
        .then(response => {
          const notes = { slug: slug, notes: response['data']['notes'] }
          commit('setNotes', notes)
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
    createNote ({ commit }, payload) {
      commit('setLoading', true)
      return new Promise((resolve, reject) => {
        window.axios.post(APPLICATION_URL + payload.slug + NOTE_URL, payload)
        .then(response => {
          const note = { slug: payload.slug, note: response['data']['note'] }
          commit('addNote', note)
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
    updateNote ({ commit }, payload) {
      commit('setLoading', true)
      return new Promise((resolve, reject) => {
        window.axios.post(APPLICATION_URL + payload.slug + NOTE_URL + '/' + payload.id, payload)
        .then(response => {
          const note = { slug: payload.slug, note: response['data']['note'] }
          commit('updateNote', note)
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
    deleteNote ({ commit }, payload) {
      commit('setLoading', true)
      return new Promise((resolve, reject) => {
        window.axios.delete(APPLICATION_URL + payload.slug + NOTE_URL + '/' + payload.id)
        .then(response => {
          commit('deleteNote', payload)
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
  }
}
