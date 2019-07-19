<template>
  <v-layout row wrap>
    <v-flex xs12>
      <v-layout column>
        <v-flex xs9 offset-xs3 class="pb-3">
          <v-layout row>
            <v-flex v-for='(column, index) in computedColumns' :key='"ColumnString " + index'>
              {{ column.answer }}
            </v-flex>
          </v-layout>
        </v-flex>
        <v-flex checkbox-grid>
          <v-layout pa-2 question-row row v-for='(row, index) in computedRows' :key='"row " + index'>
            <v-flex xs3>
              <div class="body-2">{{row.answer}}</div>
            </v-flex>
            <v-checkbox
              color="info"
              v-for='(column, index2) in computedColumns' 
              :key='"column " + index2' 
              v-model="checkAnswers[index]" 
              :value="column.id" 
              @change="onSave(row.id, column.id)"
              :disabled="disabled"
            ></v-checkbox>
          </v-layout>
        </v-flex>
      </v-layout>
    </v-flex>
  </v-layout>
</template>

<script>
  export default {
    name: 'checkbox-grid',
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
    },
    methods: {
      created () {
        let ex = []
        for (let i = 0; i < this.computedRows.length; i++) {
          const filteredResponses = this.responses.filter((response) => {
            return this.computedRows[i].id === response.answer_id
          })
          ex[i] = filteredResponses.map((response) => {
            return parseInt(response.response)
          })
        }
        this.checkAnswers = ex
      },
      checkAble (answerId, responseId) {
        const index = this.responses.findIndex((response) => {
          return response.answer_id === answerId && parseInt(response.response) === responseId
        })
        return index !== -1
      },
      responseIdFromAnswer (answerId, responseId) {
        const response = this.responses.find((response) => {
          return response.answer_id === answerId && parseInt(response.response) === responseId
        })
        return response.id
      },
      onSave (answerId, responseId) {
        if (!this.checkAble(answerId, responseId)) {
          this.$emit('create-response', [answerId, responseId])
        } else {
          this.$emit('delete-response', this.responseIdFromAnswer(answerId, responseId))
        }
      }
    }
  }
</script>

<style scoped>
  .checkbox-grid .question-row:nth-child(even) {
    background: #f5f5f5;
  }
</style>
