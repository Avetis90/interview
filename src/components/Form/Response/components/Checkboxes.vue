<template>
  <v-layout row wrap>
    <v-flex xs12 class="checkbox-group">
      <template v-for='(answer, index) in list'>
        <v-layout :key='"Option " + index' class="checkboxes">
          <v-checkbox 
            color="info"
            :disabled="disabled"
            :label="answer.answer"
            v-model='checkAnswers'
            :value="answer.id"
            @change="onSave(answer.id)"
            hide-details
          >
          </v-checkbox>
          <v-text-field
            v-if="isOtherFieldEnabled(answer)"
            :disabled="disabled"
            :value="responseValue(answer.id)"
            @change="onUpdate(answer.id, $event)"
            hide-details
            class="other-text-field"
            placeholder="more information required..."
          >
          </v-text-field>
        </v-layout>
      </template>
    </v-flex>
    <v-flex xs12 class='error' v-show='validate() !== true'>
      {{ validate() }}
    </v-flex>
  </v-layout>
</template>

<script>
  import validationMixin from '../ResponseValidationMixin'
  import * as _ from 'lodash'

  export default {
    name: 'checkboxes',
    mixins: [validationMixin],
    props: ['question', 'answers', 'responses', 'formId', 'disabled', 'formTemplateId'],
    data () {
      return {
        checkAnswers: []
      }
    },
    mounted () {
      this.checkAnswers = this.responses.map((response) => {
        return response.answer_id
      })
    },
    watch: {
      formId (value) {
        this.checkAnswers = this.responses.map((response) => {
          return response.answer_id
        })
      }
    },
    computed: {
      answerSort () {
        const question = this.$store.getters.loadedAllQuestion(this.formTemplateId, this.questionId)
        const answerSort = _.find(this.answerSorts, sort => {
          return sort.id === question.sort_id
        })
        return answerSort ? answerSort.sort : 'Undefined'
      },
      answerSorts () {
        return this.$store.getters.answerSorts
      },
      list: {
        get () {
          const answers = this.answers
          if (this.answerSort === 'Alphanumeric Ascending (A-Z)') {
            return _.orderBy(answers, ['answer'], ['asc'])
          }
          if (this.answerSort === 'Alphanumeric Descending (Z-A)') {
            return _.orderBy(answers, ['answer'], ['desc'])
          }
          if (this.answerSort === 'Number Ascending (1-9)') {
            return _.orderBy(answers, [answer => parseInt(answer.answer)], ['asc'])
          }
          if (this.answerSort === 'Number Descending (9-1)') {
            return _.orderBy(answers, [answer => parseInt(answer.answer)], ['desc'])
          }
          return _.orderBy(answers, ['order'], ['asc'])
        },
        set (value) {
        }
      }
    },
    methods: {
      responseValue (answerId) {
        const response = this.responses.find(response => response.answer_id === answerId)
        if (response) {
          return response.response
        }
        return null
      },
      checkAble (answerId) {
        const index = this.responses.findIndex((response) => {
          return response.answer_id === answerId
        })
        return index !== -1
      },
      responseIdFromAnswer (answerId) {
        const response = this.responses.find((response) => {
          return response.answer_id === answerId
        })
        return response ? response.id : null
      },
      onSave (answerId) {
        if (!this.checkAble(answerId)) {
          this.$emit('create-response', [answerId, null])
        } else {
          this.$emit('delete-response', this.responseIdFromAnswer(answerId))
        }
      },
      onUpdate (answerId, value) {
        if (this.checkAble(answerId)) {
          const response = this.responses.find((response) => response.answer_id === answerId)
          this.$emit('update-response', [answerId, value, response.id])
        }
      },
      isOtherFieldEnabled (answer) {
        const responseId = this.responseIdFromAnswer(answer.id)
        return (!answer.parameter && responseId)
      }
    }
  }
</script>

<style>
  .checkboxes .v-input--checkbox {
    padding-top:0px;
    margin-top:8px;
    margin-right:16px;
    flex:none;
  }
  .checkboxes .other-text-field {
    padding-top:0px;
    margin-top:0px;
  }
  .checkboxes .other-text-field input {
    padding-top:10px;
    padding-bottom:5px;
  }
  .checkbox-group {
    margin-bottom:20px;
  }
</style>
