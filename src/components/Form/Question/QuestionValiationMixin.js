import * as _ from 'lodash'

export default {
  props: {
    'hasValidation': {
      type: Boolean,
      default: true
    },
    'formTemplateId': {
      type: String,
      required: true
    },
    'questionId': {
      type: Number,
      default: -1
    }
  },
  data () {
    return {
      minInput: null,
      maxInput: null,
      eventsAdapter: {
        'validation-create': this.checkCreateValidation.bind(this),
        'validation-remove': this.checkRemoveValidation.bind(this)
      }
    }
  },
  methods: {
    createValidation () {
      this.$emit('create-validation', this.activeValidationType, this.minInput, this.maxInput)
    },
    updateValidation (validationType, minInput, maxInput) {
      const vType = validationType || this.activeValidationType
      const min = minInput || 0
      const max = maxInput || 0
      this.$emit('update-validation', vType, min, max)
    },
    updateMinCount (value) {
      if (parseInt(value) < parseInt(this.maxInput) || parseInt(this.maxInput) === 0) {
        this.updateValidation('', value, this.maxInput)
      }
    },
    updateMaxCount (value) {
      if (parseInt(value) > parseInt(this.minInput) || parseInt(value) === 0) {
        this.updateValidation('', this.minInput, value)
      }
    },
    updateActiveValidationType (value) {
      this.updateValidation(value, this.minInput, this.maxInput)
    },
    removeValidation () {
      this.$emit('remove-validation')
    },
    checkCreateValidation (questionId) {
      if (questionId === this.questionId) {
        this.createValidation()
      }
    },
    checkRemoveValidation (questionId) {
      if (questionId === this.questionId) {
        this.removeValidation()
      }
    },
    validateMinInput (value) {
      if (parseInt(value) > parseInt(this.maxInput) && parseInt(this.maxInput) !== 0) {
        return 'Minimum count is set bigger than maximum count.'
      } else {
        this.minInput = value
        return true
      }
    },
    validateMaxInput (value) {
      if (parseInt(value) < parseInt(this.minInput) && parseInt(value) !== 0) {
        return 'Maximum count is set smaller than minimum count.'
      } else {
        this.maxInput = value
        return true
      }
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
        return validationType || this.validationTypes[0]
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
      if (this.minInput === null) {
        this.minInput = minVal
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
      if (this.maxInput === null) {
        this.maxInput = maxVal
      }
      return maxVal
    }
  }
}
