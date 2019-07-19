<template>
  <div class="multiple-choice-grid">
    <!-- // Answer Options -->
    <v-layout row wrap>
      <v-flex xs12>
        <v-layout row>
          <v-flex xs8 offset-xs4>
            <v-layout justify-space-between row fill-height>
              <div v-for='(column, index) in computedColumns' :key='"OptionString " + index' class="column text-xs-center py-3">
                {{ column.answer }}
              </div>
            </v-layout>
          </v-flex>
          </v-layout>
      </v-flex>
    </v-layout>

    <!-- // Questions -->
    <v-layout row wrap question-row v-for='(row, index) in computedRows' :key='"row " + index'>
      <v-flex xs12>
        <v-layout row>
          <v-flex xs4 pa-3>
            <div class="body-2">{{row.answer}}</div>
          </v-flex>
          <v-flex xs8>
            <v-layout justify-space-between row fill-height>
              <div
                v-for='(column, index2) in computedColumns'
                :key='"column " + index2'
                class="column text-xs-center">
                <v-radio-group v-model="checkAnswers[index]" class="py-0">
                  <v-radio
                    color="info"
                    :value="column.id"
                    @change="onSave(row.id, column.id)"
                    class="mx-0"
                    :disabled="disabled"
                  ></v-radio>
                </v-radio-group>
              </div>
            </v-layout>
          </v-flex>
        </v-layout>
      </v-flex>
    </v-layout>

  </div>
</template>

<script>
  export default {
    name: 'multiple-choice-grid',
    props: ['question', 'answers', 'responses', 'formId', 'disabled'],
    data () {
      return {
        checkAnswers: []
      }
    },
    watch: {
      formId (value) {
        this.created()
      }
    },
    mounted () {
      this.created()
    },
    methods: {
      created () {
        let ex = []
        for (let i = 0; i < this.computedRows.length; i++) {
          const filteredResponses = this.responses.filter((response) => {
            return this.computedRows[i].id === response.answer_id
          })
          if (filteredResponses.length) {
            ex[i] = parseInt(filteredResponses[0].response)
          } else {
            ex[i] = null
          }
        }
        this.checkAnswers = ex
      },
      isNew (answerId) {
        const index = this.responses.findIndex((response) => {
          return response.answer_id === answerId
        })

        if (index === -1) {
          return false
        } else {
          return true
        }
      },
      responseIdFromAnswer (answerId) {
        const response = this.responses.find((response) => {
          return response.answer_id === answerId
        })
        return response.id
      },
      onSave (answerId, response) {
        if (!this.isNew(answerId)) {
          this.$emit('create-response', [answerId, response])
        } else {
          this.$emit('update-response', [answerId, response, this.responseIdFromAnswer(answerId)])
        }
      }
    },
    computed: {
      computedRows () {
        return this.answers.filter((answer) => {
          return !answer.parameter
        })
      },
      computedColumns () {
        return this.answers.filter((answer) => {
          return answer.parameter
        })
      }
    }
  }
</script>

<style>
  .multiple-choice-grid .question-row:nth-child(even) {
    background: #f5f5f5;
  }
  .multiple-choice-grid .column {
    width:100%;
  }
  .multiple-choice-grid .column .v-input__control,
  .multiple-choice-grid .column .v-input--selection-controls__input {
    margin:0 auto;
  }
</style>