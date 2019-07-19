<template>
  <div>
    <v-layout row>
      <!-- // Source -->
      <v-flex xs4 px-3>
        <v-autocomplete
          :items="sources"
          label="Source"
          v-model="filter.source"
          item-text="question"
          item-value="question"
          single-line
          return-object
        >
          <template
            slot="selection"
            slot-scope="data"
          >
            {{ data.item.question }}
          </template>
          <template
            slot="item"
            slot-scope="data"
          >
            <v-list-tile-content>
              <v-list-tile-title>{{data.item.question}}</v-list-tile-title>
              <v-list-tile-sub-title>{{data.item.group}}</v-list-tile-sub-title>
            </v-list-tile-content>
          </template>
        </v-autocomplete>
      </v-flex>

      <!-- // Query -->
      <v-flex xs3 px-3>
        <v-autocomplete
          label="Query"
          v-model="filter.query"
          :items="query"
          item-text="comparator"
          item-value="id"
        >
        </v-autocomplete>
      </v-flex>

      <!-- //Selected Answer -->
      <v-flex xs3 px-3 v-if='selectedTriggerType && selectedTriggerType.answer'>
        <v-autocomplete
          :items="parentQuestionType == 8 || parentQuestionType == 9 ? falseAnswers : answers"
          item-text="answer"
          item-value="id"
          v-model="filter.answer"
          label="Answer"
          single-line
        ></v-autocomplete>
      </v-flex>

      <!-- //User Input -->
      <v-flex xs3 px-3 v-else>
        <v-flex xs12 v-if="parentQuestionType == 8 || parentQuestionType == 9">
          <v-autocomplete
            v-model="filter.value"
            :items="trueAnswers"
            item-text="answer"
            item-value="id"
            label="Value"
            single-line
            :disabled="!selectedTriggerType"
          ></v-autocomplete>
        </v-flex>
        <!-- Trigger Value
        <v-flex xs12 v-else>
          <v-text-field
            label="Value"
            type="text"
            v-model="filter.value"
            :disabled="!selectedTriggerType"
          ></v-text-field>
        </v-flex>
        -->
      </v-flex>

      <!-- //Selected Value -->
      <v-flex xs3 px-3 v-if='selectedTriggerType && selectedTriggerType.value'>
        <v-text-field
          label="Value"
          type="text"
          v-model="filter.value"
          :disabled="!selectedTriggerType"
        ></v-text-field>
      </v-flex>

      <!-- // Actions -->
      <v-flex xs2 px-3 mt-2 text-xs-right>
        <v-btn outline color="error" @click.stop="deleteFilter(index)">
          <v-icon>delete</v-icon>
        </v-btn>
      </v-flex>
    </v-layout>
    <v-divider class="my-1"></v-divider>
  </div>
</template>

<script>
import * as _ from 'lodash'
export default {
  name: 'ReportComponent',
  data () {
    return {
      slug: window.location.hostname.split('.')[0]
    }
  },
  props: ['filter', 'index'],
  computed: {
    questions () {
      return this.$store.getters.loadedApplicationQuestions(this.slug)
    },
    sources () {
      let sources = [
        {'group': 'Form Detail', 'question': 'Form Template'},
        {'group': 'Form Detail', 'question': 'Owner'},
        {'group': 'Form Detail', 'question': 'Owner Email'},
        {'group': 'Form Detail', 'question': 'Organisation'},
        {'group': 'Form Detail', 'question': 'Progress'},
        {'group': 'Form Detail', 'question': 'Period Start'},
        {'group': 'Form Detail', 'question': 'Period End'},
        {'group': 'Form Detail', 'question': 'Status'},
        {'group': 'Form Detail', 'question': 'Created'},
        {'group': 'Form Detail', 'question': 'Modified'}
      ]
      _.forEach(this.questions, (question) => {
        sources.push({'group': question.form_template_name + ' > ' + question.section_name, 'question': question.question, 'id': question.id})
      }, this)
      return sources
    },
    comparators () {
      return this.$store.getters.comparators
    },
    triggerTypes () {
      return this.$store.getters.triggerTypes
    },
    parentQuestion () {
      const questionSource = this.sources.find((source) => source.question_id === this.filter.source.id || source.question === this.filter.source.question)
      if (!questionSource || !questionSource.id) {
        return null
      }
      return this.questions.find((question) => question.id === questionSource.id)
    },
    parentQuestionType () {
      const parentQuestion = this.parentQuestion
      if (!parentQuestion) {
        return 1
      }
      return parentQuestion.question_type_id
    },
    query () {
      if (!this.filter.source) {
        return []
      }
      const parentQuestion = this.parentQuestion
      let questionTypeId = 1
      if (parentQuestion) {
        questionTypeId = parentQuestion.question_type_id
      }
      return this.comparators.filter(e => {
        return this.triggerTypes.find((triggerType) => {
          return triggerType.comparator_id === e.id && triggerType.question_type_id === questionTypeId
        })
      })
    },
    answers () {
      return this.parentQuestion.answers
    },
    trueAnswers () {
      return this.answers.filter(e => {
        return e.parameter
      })
    },
    falseAnswers () {
      return this.answers.filter(e => {
        return !e.parameter
      })
    },
    selectedTriggerType () {
      const parentQuestionType = this.parentQuestionType
      const selected = this.$store.getters.triggerTypes.filter(e => {
        return e.question_type_id === parentQuestionType && e.comparator_id === this.filter.query
      })
      if (selected.length > 0) {
        return selected[0]
      }
      return null
    }
  },
  methods: {
    deleteFilter (index) {
      this.$emit('deleteFilter', index)
    }
  }
}
</script>