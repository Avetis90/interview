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
      <v-flex v-if='"Maximum Value" !== activeValidationType' xs3 offset-xs1>
        <v-text-field
          name='min-char-count'
          label='Minimum value'
          v-model='minInput'
          :value='minValue'
          type='number'
          @change='updateMinCount'
          :rules='[validateMinInput]'
        ></v-text-field>
      </v-flex>
      <v-flex v-if='"Minimum Value" !== activeValidationType' xs3 offset-xs1>
        <v-text-field
          name='max-char-count'
          label='Maximum value'
          v-model='maxInput'
          :value='maxValue'
          type='number'
          @change='updateMaxCount'
          :rules='[validateMaxInput]'
        ></v-text-field>
      </v-flex>
    </v-layout>
    <Fix
      :question-id="questionId"
      :section-id="sectionId"
      :form-template-id="formTemplateId"
    >
    </Fix>
  </div>
</template>

<script>
  import validationMixin from '../QuestionValiationMixin'
  const Fix = () => import('../Fix')
  export default {
    name: 'Decimal',
    mixins: [
      validationMixin
    ],
    components: {
      Fix
    },
    props: ['answers', 'sectionId', 'formTemplateId'],
    data () {
      return {
        validationTypes: [
          'Minimum Value',
          'Maximum Value',
          'Between',
          'Decimal validation'
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
