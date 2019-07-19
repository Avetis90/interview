<template>
  <v-layout row wrap>

    <v-flex xs12>
      <v-layout wrap>

        <!-- //Question -->
        <v-flex xs12 sm3>
          <v-autocomplete
            :items="questionOptions"
            item-text="question"
            item-value="id"
            v-model="parentQuestionId"
            label="Parent Question"
            single-line
            @change="updateParentQuestion($event)"
          >
            <template
              slot="selection"
              slot-scope="data"
            >
              {{data.item.question}}
            </template>
            <template
              slot="item"
              slot-scope="data"
            >
              <v-list-tile-content>
                <v-list-tile-title>{{data.item.question}}</v-list-tile-title>
                <v-list-tile-sub-title>{{getSection(data.item.id)}}</v-list-tile-sub-title>
              </v-list-tile-content>
            </template>
          </v-autocomplete>
        </v-flex>

        <!-- //Question Comparator -->
        <v-flex xs12 sm3 offset-sm1 d-flex>
          <v-autocomplete
            :items="comparators"
            item-text="comparator"
            item-value="id"
            v-model="comparatorId"
            label="Comparator"
            single-line
            @change="updateComparator($event)"
          ></v-autocomplete>
        </v-flex>

        <!-- //Selected Answer -->
        <v-flex xs12 sm3 offset-sm1 v-if='selectedTriggerType && selectedTriggerType.answer'>
          <v-autocomplete
            :items="multiQuestionType ? falseAnswers : answers"
            item-text="answer"
            item-value="id"
            v-model="parentAnswerId"
            label="Parent Answer"
            single-line
            @change="updateParentAnswer($event)"
          ></v-autocomplete>
        </v-flex>

        <!-- //User Input -->
        <v-flex xs12 sm3 offset-sm1 v-if='selectedTriggerType && selectedTriggerType.value'>
          <v-flex xs12 v-if="multiQuestionType === 1">
            <v-autocomplete
              v-model="value"
              :items="trueAnswers"
              item-text="answer"
              item-value="id"
              label="Value"
              single-line
              @change="updateValue($event)"
            ></v-autocomplete>
          </v-flex>
          <v-flex xs12 v-else>
            <v-text-field
              label="Value"
              type="text"
              v-model="value"
              @change="updateValue($event)"
            ></v-text-field>
          </v-flex>
        </v-flex>

        <!-- //Delete Logic -->
        <v-spacer></v-spacer>
        <v-flex xs12 sm1 text-xs-center text-sm-right>
          <v-btn flat icon @click="deleteTrigger()" class="mt-3">
            <v-icon>close</v-icon>
          </v-btn>
        </v-flex>
      </v-layout>
    </v-flex>

    <!-- // Comparator Join -->
    <v-layout row wrap>
      <v-flex xs12 sm3 offset-sm4>
        <v-select
          :items="operators"
          item-text="operator"
          item-value="id"
          v-model="operator"
          label="Operator"
          single-line
          @change="updateOperator($event)"
          v-if='!isLast'
        ></v-select>
      </v-flex>

    </v-layout>
  </v-layout>
</template>

<script>
  export default {
    props: ['formTemplateId', 'trigger', 'questionOptions', 'isLast'],
    data () {
      return {
        parentQuestionId: this.trigger.parent_question_id,
        parentAnswerId: this.trigger.parent_answer_id,
        value: this.trigger.value,
        comparatorId: this.trigger.comparator_id,
        operator: this.trigger.operator ? 1 : 0,
        operators: [
          { id: 0, operator: 'AND' },
          { id: 1, operator: 'OR' }
        ]
      }
    },
    computed: {
      parentQuestion () {
        return this.$store.getters.loadedAllQuestion(this.formTemplateId, this.parentQuestionId)
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
      questionTypes () {
        return this.$store.getters.questionTypes
      },
      parentQuestionType () {
        return this.parentQuestion.question_type_id
      },
      multiQuestionType () {
        if (this.getQuestionType(this.parentQuestionType) === 'Multiple choice grid' ||
          this.getQuestionType(this.parentQuestionType) === 'Checkbox grid') {
          return 1
        }
        if (this.getQuestionType(this.parentQuestionType) === 'Address' ||
          this.getQuestionType(this.parentQuestionType) === 'ABN Lookup') {
          return 2
        }
        return 0
      },
      triggerTypes () {
        return this.$store.getters.triggerTypes.filter(e => {
          return e.question_type_id === this.parentQuestionType
        })
      },
      comparators () {
        return this.$store.getters.comparators.filter(e => {
          return this.triggerTypes.map(x => x.comparator_id).includes(e.id)
        })
      },
      selectedTriggerType () {
        const selected = this.$store.getters.triggerTypes.filter(e => {
          return e.question_type_id === this.parentQuestionType && e.comparator_id === this.comparatorId
        })
        if (selected.length > 0) {
          return selected[0]
        }
        return null
      }
    },
    methods: {
      getQuestionType (questionTypeId) {
        const questionType = this.questionTypes.find((questionType) => {
          return questionType.id === questionTypeId
        })
        return questionType ? questionType.type : 'undefined'
      },
      getSection (questionId) {
        const allSections = this.$store.getters.loadedSections(this.formTemplateId)
        const section = allSections.find((section) => {
          return section.questions.find((question) => {
            return question.id === questionId
          })
        })
        if (section) {
          return section.name
        } else {
          return null
        }
      },
      updateParentQuestion (value) {
        if (typeof (value) === 'object') {
          return
        }
        this.parentQuestionId = value
        this.updateTrigger()
      },
      updateParentAnswer (value) {
        this.parentAnswerId = value
        this.updateTrigger()
      },
      updateComparator (value) {
        this.comparatorId = value
        this.updateTrigger()
      },
      updateValue (value) {
        this.value = value
        this.updateTrigger()
      },
      updateOperator (value) {
        this.operator = value
        this.updateTrigger()
      },
      deleteTrigger () {
        this.$store.dispatch('deleteTrigger', {
          formTemplateId: this.formTemplateId,
          id: this.trigger.id
        })
      },
      updateTrigger () {
        this.$store.dispatch('updateTrigger', {
          id: this.trigger.id,
          formTemplateId: this.formTemplateId,
          parentQuestionId: this.parentQuestionId,
          parentAnswerId: this.parentAnswerId,
          value: this.value,
          comparatorId: this.comparatorId,
          operator: this.operator
        })
      }
    }
  }
</script>
