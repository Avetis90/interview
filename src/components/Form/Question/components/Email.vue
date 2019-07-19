<template>
  <div>
    <v-layout v-if='hasValidation' row wrap>
      <v-flex xs12 mt-2 mb-2>
        <v-divider></v-divider>
      </v-flex>
      <v-flex xs12 class="body-2">Validation</v-flex>
      <v-flex xs4>
        <v-select
          label='Validation type'
          :items='validationTypes'
          v-model='activeValidationType'
        ></v-select>
      </v-flex>
      <v-flex v-if='"Decimal validation" !== activeValidationType' xs3 offset-xs1>
        <v-text-field
          name='min-char-count'
          label='Minimum count'
          v-model='minInput'
          :value='minValue'
          type='number'
          @change='updateMinCount'
          :rules='[validateMinInput]'
        ></v-text-field>
      </v-flex>
      <v-flex xs3 offset-xs1>
        <v-text-field
          name='max-char-count'
          label='Maximum count'
          v-model='maxInput'
          :value='maxValue'
          type='number'
          @change='updateMaxCount'
          :rules='[validateMaxInput]'
        ></v-text-field>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
  import validationMixin from '../QuestionValiationMixin'

  export default {
    name: 'Email',
    mixins: [
      validationMixin
    ],
    props: {
      'answers': {
        default: function () {
          return []
        }
      }
    },
    data () {
      return {
        validationTypes: [
          'Email'
        ]
      }
    },
    mounted () {
      if (this.answers.length) {
        this.$emit('delete-answers')
      }
      this.$root.$on('validation-create', this.eventsAdapter['validation-create'])
      this.$root.$on('validation-remove', this.eventsAdapter['validation-remove'])
    },
    beforeDestroy () {
      this.$root.$off('validation-create', this.eventsAdapter['validation-create'])
      this.$root.$off('validation-remove', this.eventsAdapter['validation-remove'])
    }
  }
</script>
