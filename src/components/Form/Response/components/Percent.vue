<template>
  <v-layout row>
    <v-flex xs12>
      <v-slider
        :value="message"
        @change="onSave($event)"
        thumb-label="always"
        :disabled="disabled"
        :step="decimal"
        :min="min"
        :max="max"
        always-dirty
        label="%"
        inverse-label
      ></v-slider>
    </v-flex>
  </v-layout>
</template>

<script>
  export default {
    name: 'Percent',
    props: ['question', 'answers', 'responses', 'disabled', 'formTemplateId', 'questionId'],
    methods: {
      onSave (value) {
        if (this.responses.length) {
          this.$emit('update-response', [null, value, this.responses[0].id])
        } else {
          this.$emit('create-response', [null, value])
        }
      }
    },
    computed: {
      message () {
        if (this.responses.length) {
          return this.responses[0].response
        }
        return ''
      },
      min () {
        if (this.validations && this.validations.length === 1) {
          if (this.validationType === 'Number') {
            return this.validations[0].validation_data.split(',')[0] || 0
          }
        }
        return 0
      },
      max () {
        if (this.validations && this.validations.length === 1) {
          if (this.validationType === 'Number') {
            return this.validations[0].validation_data.split(',')[1] || 100
          }
        }
        return 100
      },
      decimal () {
        let decimal = 0
        if (this.validations && this.validations.length === 1) {
          if (this.validationType === 'Decimal validation') {
            decimal = this.validations[0].validation_data.split(',')[1]
          }
        }
        return 1 / (10 ** decimal)
      },
      validationType () {
        if (this.validations && this.validations.length === 1) {
          return this.validationTypes.find((validationType) => {
            return validationType.id === this.validations[0].validation_type_id
          }).type
        }
        return null
      },
      validationTypes () {
        return this.$store.getters.validationTypes
      },
      validations () {
        return this.$store.getters.loadedQuestionValidation(this.formTemplateId, this.questionId)
      }
    }
  }
</script>

<style>
.question-group .v-input--slider {
  margin-top:30px;
}
</style>
