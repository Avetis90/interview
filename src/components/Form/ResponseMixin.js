import get from 'lodash/get'
export default {
  name: 'ResponseMixin',
  methods: {
    formatResponse (question, questionResponses) {
      const responses = questionResponses.filter(r => r.question_id === question.id)
      let formatted = []
      switch (question.question_type) {
        case 'File upload': formatted = responses.map(r => this.getFileResponse(r.response))
          break
        case 'Checkbox grid':
        case 'Multiple choice grid': formatted = responses.map(r => this.getGridResponse(r, question.answers))
          break
        case 'Lookup': formatted = this.getLookupResponse(question, responses)
          break
        default: formatted = responses.map(r => this.getResponse(r, question.answers))
      }
      return formatted.filter(r => r && r.length).join(', ')
    },
    getFileResponse (response) {
      let file = null
      try {
        file = JSON.parse(response)
      } catch (error) {}
      return file && file[0] && file[0].url ? file[0].url : ''
    },
    getGridResponse (response, answers) {
      let formatted = []
      const answer = answers.find(a => a.id === response.answer_id)
      const label = answers.find(a => a.id === parseInt(response.response))
      formatted.push(get(answer, 'answer'))
      formatted.push(get(label, 'answer'))
      return formatted.filter(r => r && r.length).join(': ')
    },
    getResponse (response, answers) {
      let formatted = []
      const answer = answers.find(a => a.id === response.answer_id)
      formatted.push(get(answer, 'answer'))
      formatted.push(response.response)
      return formatted.filter(r => r && r.length).join(': ')
    },
    getLookupResponse (question, responses) {
      let formatted = []
      const response = [...responses].shift()
      const result = response.lookup ? response.lookup : ''
      formatted.push(result)
      return formatted
    }
  }
}
