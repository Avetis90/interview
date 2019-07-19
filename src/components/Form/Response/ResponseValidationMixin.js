import * as _ from 'lodash'

export default {
  props: {
    'formTemplateId': {
      type: Number,
      required: true
    },
    'questionId': {
      type: Number,
      default: -1
    }
  },
  methods: {
    countDecimals (value) {
      if (!value || Math.floor(value) === value) return 0
      const numbers = value.toString().split('.')
      return numbers.length > 1 ? numbers[1].length : 0
    },
    validate (value) {
      if (this.activeValidationType) {
        if (this.activeValidationType === 'Number') {
          if (!this._isNumeric(value)) {
            return 'This value must be a number.'
          } else if (parseInt(value) < this.minValue) {
            return `This value must be greater than or equal to ${this.minValue}.`
          } else if (parseInt(value) > this.maxValue && this.maxValue !== 0) {
            return `This value must be less than or equal to ${this.maxValue}.`
          }
          return true
        } else if (this.activeValidationType === 'Letters') {
          if (value.length < this.minValue) {
            return `Minimum ${this.minValue} characters allowed.`
          } else if (value.length > this.maxValue && this.maxValue !== 0) {
            return `Maximum ${this.maxValue} characters allowed.`
          }
          return true
        } else if (this.activeValidationType === 'Words') {
          if (value.split(' ').length < this.minValue) {
            return `Minimum ${this.minValue} words required.`
          } else if (value.split(' ').length > this.maxValue && this.maxValue !== 0) {
            return `Maximum ${this.maxValue} words allowed.`
          }
          return true
        } else if (this.activeValidationType === 'Email') {
          if (this._validateEmail(value)) {
            return true
          }
          return 'This value should be a valid email.'
        } else if (this.activeValidationType === 'Checkbox') {
          if (this.responses.length < this.minValue) {
            return `Minimum ${this.minValue} answers required.`
          } else if (this.responses.length > this.maxValue && this.maxValue !== 0) {
            return `Maximum ${this.maxValue} answers allowed.`
          }
          return true
        } else if (this.activeValidationType === 'Decimal validation') {
          if (isNaN(value) || this.countDecimals(value) > this.maxValue) {
            return `Maximum ${this.maxValue} decimals allowed.`
          }
          return true
        } else if (this.activeValidationType === 'Minimum Value') {
          if (parseInt(value) < this.minValue) {
            return `This value must be greater than or equal to ${this.minValue}.`
          }
          return true
        } else if (this.activeValidationType === 'Maximum Value') {
          if (parseInt(value) > this.maxValue) {
            return `This value must be less than or equal to ${this.maxValue}.`
          }
          return true
        } else if (this.activeValidationType === 'Between') {
          if (!this._isNumeric(value)) {
            return 'This value must be a number.'
          } else if (parseInt(value) < this.minValue) {
            return `This value must be greater than or equal to ${this.minValue}.`
          } else if (parseInt(value) > this.maxValue && this.maxValue !== 0) {
            return `This value must be less than or equal to ${this.maxValue}.`
          }
          return true
        } else {
          console.log('unsupported validation type', this.activeValidationType)
          return false
        }
      }
      return true
    },
    _isNumeric (n) {
      return /^\d+$/.test(n)
    },
    _validateEmail (email) {
      return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)
    }
  },
  computed: {
    activeValidationType: {
      get: function () {
        const validations = this.$store.getters.loadedQuestionValidation(this.formTemplateId, this.questionId)
        const validationTypes = this.$store.getters.validationTypes
        let validationType = null
        if (validations && validations.length && validations.length === 1 && validationTypes && validationTypes.length > 0) {
          const index = _.findIndex(validationTypes, type => { return validations[0].validation_type_id === type.id })
          if (index > -1) {
            validationType = validationTypes[index].type
          } else {
            validationType = ''
          }
        }
        return validationType
      },
      set: function (value) {
        this.updateActiveValidationType(value)
      }
    },
    minValue () {
      const validations = this.$store.getters.loadedQuestionValidation(this.formTemplateId, this.questionId)
      let minVal
      if (validations && validations.length && validations.length === 1) {
        const validationData = validations[0].validation_data
        minVal = parseInt(validationData.split(',')[0]) || 0
      } else {
        minVal = 0
      }
      return minVal
    },
    maxValue () {
      const validations = this.$store.getters.loadedQuestionValidation(this.formTemplateId, this.questionId)
      let maxVal
      if (validations && validations.length && validations.length === 1) {
        const validationData = validations[0].validation_data
        maxVal = parseInt(validationData.split(',')[1]) || 0
      } else {
        maxVal = 0
      }
      return maxVal
    }
  }
}
