<template>
  <v-layout row wrap justify-space-around>
    <v-flex xs5 style='min-width: 200px'>
      <h3>Rows</h3>
      <draggable v-model='rows' class='dragArea1' :options='{draggable:".answer"}' style='min-height: 100px' @end='checkEnd'>
        <v-layout row v-for='(rowAnswer, index) in rows' :key='"Option " + index' class='answer' :class='"answer" + rowAnswer.id'>
          <v-flex style='max-width: 20px; min-width: 20px' class='mt-4'>
            {{index+1}}.
          </v-flex>
          <v-flex xs10 style='min-width: 60px'>
            <v-text-field
              :value='rowAnswer.answer'
              @change='updateAnswer(rowAnswer.id, $event)'
            ></v-text-field>
          </v-flex>
          <v-flex style='width: 30px'  v-show='rows.length > 1'>
            <v-btn flat icon @click='deleteAnswer(rowAnswer.id)' class='mt-3'>
              <v-icon>close</v-icon>
            </v-btn>
          </v-flex>
        </v-layout>
        <v-layout row d-inline-flex>
          <v-flex style='min-width: 20px' class='mt-4'>
            {{rows.length+1}}.
          </v-flex>
          <v-flex xs10 style='max-width: 80px'>
            <v-text-field
              value='Add option'
              @click='createAnswer(false)'
            ></v-text-field>
          </v-flex>
        </v-layout>
      </draggable>
    </v-flex>
    <v-flex xs5 style='min-width: 200px'>
      <h3>Columns</h3>
      <draggable v-model='columns' class='dragArea2' :options='{draggable:".answer"}' style='min-height: 100px' @end='checkEnd'>
        <v-layout row v-for='(columnAnswer, index) in columns' :key='"Option " + index' class='answer' :class='"answer" + columnAnswer.id'>
          <v-flex xs10 style='min-width: 120px'>
            <v-text-field
              prepend-icon='radio_button_unchecked'
              :value='columnAnswer.answer'
              @change='updateAnswer(columnAnswer.id, $event)'
            ></v-text-field>
          </v-flex>
          <v-flex style='width: 30px' v-show='columns.length > 1'>
            <v-btn flat icon @click='deleteAnswer(columnAnswer.id)' class='mt-3'>
              <v-icon>close</v-icon>
            </v-btn>
          </v-flex>
        </v-layout>
        <v-layout row d-inline-flex>
          <v-flex style='width: 125px'>
            <v-text-field
              prepend-icon='radio_button_unchecked'
              value='Add option'
              @click='createAnswer(true)'
            ></v-text-field>
          </v-flex>
        </v-layout>
      </draggable>
    </v-flex>
  </v-layout>
</template>

<script>
  import draggable from 'vuedraggable'
  export default {
    name: 'multiple-choice-grid',
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
    methods: {
      createAnswer (parameter) {
        let str = `Row ${this.rows.length + 1}`
        if (parameter) {
          str = `Column ${this.columns.length + 1}`
        }
        this.$emit('create-answer', [str, parameter])
      },
      deleteAnswer (index) {
        this.$emit('delete-answer', index)
      },
      updateAnswer (index, value) {
        this.$emit('update-answer', [index, value])
      },
      checkEnd: function (evt) {
        if (evt.to.className !== evt.from.className) {
          return
        }
        if (evt.newIndex === evt.oldIndex) {
          return
        }
        let newIndex = evt.newIndex

        if (evt.newIndex > evt.oldIndex) {
          newIndex = newIndex + 1
        }

        let order = 1
        if (evt.to.className === 'dragArea1') {
          if (this.rows.length === newIndex) {
            order = this.rows[newIndex - 1].order + 1
          } else {
            order = this.rows[newIndex].order
          }
        } else {
          if (this.columns.length === newIndex) {
            order = this.columns[newIndex - 1].order + 1
          } else {
            order = this.columns[newIndex].order
          }
        }

        const elementId = parseInt(evt.item.className.substr(24))
        this.$emit('move-answer', [elementId, order])
      }
    },
    mounted () {
      if (this.answers.length === 0) {
        this.createAnswer(true)
        this.createAnswer(false)
      } else {
        if (this.answers.length === 2 && this.answers[0].answer.substr(0, 11) === 'LinearScale' && this.answers[1].answer.substr(0, 11) === 'LinearScale') {
          this.$emit('delete-answers')
        } else {
          const lastAnswer = this.answers[this.answers.length - 1]
          const firstAnswer = this.answers[0]
          if (lastAnswer.parameter) {
            this.createAnswer(false)
          }
          if (!firstAnswer.parameter) {
            this.createAnswer(true)
          }
        }
      }
    },
    computed: {
      rows: {
        get () {
          return this.answers.filter(e => { return !e.parameter })
          .sort((a, b) => { return a.order > b.order })
        },
        set (value) {
          // TODO: draggable
        }
      },
      columns: {
        get () {
          return this.answers.filter(e => { return e.parameter })
          .sort((a, b) => { return a.order > b.order })
        },
        set (value) {
          // TODO: draggable
        }
      }
    }
  }
</script>
