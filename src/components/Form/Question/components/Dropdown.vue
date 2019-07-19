<template>
  <draggable v-model='list' class='dragArea' :options='{draggable:".answer"}' style='min-height: 100px' @end='checkEnd'>
    <v-layout row v-for='(answer, index) in list' :key='"Option " + index' class='answer' :class='"answer" + answer.id'>
      <v-flex style='max-width: 30px; min-width: 30px' class='mt-4'>
        {{index+1}}.
      </v-flex>
      <v-flex xs10 style='min-width: 60px'>
        <v-text-field
          v-model='answer.answer'
          @change='showModal(answer.id, $event)'
          placeholder="Enter answer text"
        ></v-text-field>
      </v-flex>
      <v-flex style='width: 30px'  v-show='answers.length > 1'>
        <v-btn flat icon @click='deleteAnswer(answer.id)' class='mt-4'>
          <v-icon>close</v-icon>
        </v-btn>
      </v-flex>
    </v-layout>
    <v-layout row d-inline-flex>
      <v-flex style='min-width: 20px' class='mt-4'>
        {{answers.length+1}}.
      </v-flex>
      <v-flex xs10 style='max-width: 80px'>
        <v-text-field
          value='Add answer'
          @click='createAnswer'
        ></v-text-field>
      </v-flex>
    </v-layout>
    <v-dialog
      v-model="dialog"
      width="500"
      ref="dialog"
    >
      <v-card>
        <v-card-title>
          Multi Answer
        </v-card-title>

        <v-card-text>
          A comma has been detected in the answer string, would you like to split this string into multiple answers?
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            flat
            @click="updateAnswer(true)"
          >
            Yes
          </v-btn>
          <v-btn
            color="error"
            flat
            @click="updateAnswer(false)"
          >
            No
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </draggable>
</template>

<script>
  import * as _ from 'lodash'
  import validationMixin from '../QuestionValiationMixin'
  const draggable = () => import('vuedraggable')
  export default {
    name: 'dropdown',
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
    components: {
      draggable
    },
    data () {
      return {
        validationTypes: [
          'Dropdown'
        ],
        dialog: false,
        multiAnswer: '',
        multiAnswerId: -1
      }
    },
    methods: {
      createAnswer () {
        this.$emit('create-answer', [null, true])
      },
      deleteAnswer (index) {
        this.$emit('delete-answer', index)
      },
      setHasOther () {
        this.$emit('create-answer', ['Other...', false])
      },
      showModal (index, value) {
        this.multiAnswer = value
        this.multiAnswerId = index
        if (value.includes(',')) {
          this.dialog = true
        } else {
          this.updateAnswer(false)
        }
      },
      updateAnswer (flag) {
        if (flag) {
          const index = this.multiAnswerId
          const value = this.multiAnswer
          const values = value.split(',').map((value) => value.trim())
          this.$emit('update-answer', [index, values[0]])
          let _this = this
          _.forEach(values, function (value, index) {
            if (index === 0) {
              return
            }
            _this.$emit('create-answer', [value, true])
          })
        } else {
          this.$emit('update-answer', [this.multiAnswerId, this.multiAnswer])
        }
        this.dialog = false
      },
      checkEnd: function (evt) {
        if (evt.newIndex === evt.oldIndex) {
          return
        }
        let newIndex = evt.newIndex

        if (evt.newIndex > evt.oldIndex) {
          newIndex = newIndex + 1
        }

        let order = 1
        if (this.answers.length === newIndex) {
          order = this.answers[newIndex - 1].order + 1
        } else {
          order = this.answers[newIndex].order
        }

        const elementId = parseInt(evt.item.className.substr(24))
        this.$emit('move-answer', [elementId, order])
      }
    },
    mounted () {
      if (this.answers.length === 0) {
        this.$emit('create-answer', [null, true])
      } else {
        if (this.answers.length === 2 && this.answers[0].answer && this.answers[0].answer.substr(0, 11) === 'LinearScale' && this.answers[1].answer.substr(0, 11) === 'LinearScale') {
          this.$emit('delete-answers')
        }
      }
      this.$root.$on('validation-create', this.eventsAdapter['validation-create'])
      this.$root.$on('validation-remove', this.eventsAdapter['validation-remove'])
    },
    computed: {
      question () {
        return this.$store.getters.loadedAllQuestion(this.formTemplateId, this.questionId)
      },
      answerSort () {
        const answerSort = _.find(this.answerSorts, sort => {
          return sort.id === this.question.sort_id
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
          // TODO: Drggable components
        }
      }
    },
    beforeDestroy () {
      this.$root.$off('validation-create', this.eventsAdapter['validation-create'])
      this.$root.$off('validation-remove', this.eventsAdapter['validation-remove'])
    }
  }
</script>
