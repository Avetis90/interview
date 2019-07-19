<template>
  <div>
    <v-layout row>
      <v-flex xs10>
        <v-text-field
          name="paragraph"
          value="Long answer text"
          multiple
          disabled
        ></v-text-field>
      </v-flex>
    </v-layout>
    <v-layout v-if="hasValidation" row>
      <v-flex xs4>
        <v-select
          label='Validation type'
          :items="validationTypes"
          v-model="activeValidationType"
        ></v-select>
      </v-flex>
      <v-flex v-if='"Checkbox" !== activeValidationType' xs3 offset-xs1>
        <v-text-field
          name='min-char-count'
          label='Minimum count'
          v-model='minInput'
          :value='minValue'
          mask='###'
          @change='updateMinCount'
        ></v-text-field>
      </v-flex>
      <v-flex v-if='"Checkbox" !== activeValidationType' xs3 offset-xs1>
        <v-text-field
          name='max-char-count'
          label='Maximum count'
          v-model='maxInput'
          :value='maxValue'
          mask='###'
          @change='updateMaxCount'
        ></v-text-field>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
  import validationMixin from '../QuestionValiationMixin'

  export default {
    name: 'paragraph',
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
          'Words', 'Letters'
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
