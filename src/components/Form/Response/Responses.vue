<template>
  <v-flex xs12 :class='"sm" + (question.width ? question.width : 12)' question-group px-3>
    
    <v-layout row wrap question-head v-if="this.hide !== true">
      <v-flex xs12>
        <div class="body-2">
          {{ editedName }}
          <span v-if="question.mandatory" class="red--text">*</span>
        </div>
      </v-flex>
      <v-flex xs12>
        <div class="body-1 grey--text text--darken-1" v-if='editedDescription'>
          <div v-html="$sanitize(editedDescription)"></div>
        </div>
      </v-flex>
    </v-layout>

    <component
      :is="questionComponent"
      :answers="answers"
      :responses="responses"
      :question-id="question.id"
      :question="editedName"
      :mandatory="question.mandatory"
      :form-template-id="formTemplateId"
      :section-id="sectionId"
      :form-id="formId"
      :disabled="status === 'Closed'"
      :hasValidation="hasValidation"
      @create-response="createResponse"
      @update-response="updateResponse"
      @delete-response="deleteResponse"
    ></component>

    <!-- //Show snackbar -->
    <Snackbar content="Progress saved" :snackbar="snackbarVisible" @dismissed="snackbarVisible = false"></Snackbar>
  </v-flex>
</template>

<script>
  import * as _ from 'lodash'
  import shortAnswer from './components/ShortAnswer'
  import paragraph from './components/Paragraph'
  import multipleChoice from './components/MultipleChoice'
  import checkboxes from './components/Checkboxes'
  import dropdown from './components/Dropdown'
  import fileupload from './components/FileUpload'
  import linearScale from './components/LinearScale'
  import multipleChoiceGrid from './components/MultipleChoiceGrid'
  import checkboxGrid from './components/CheckboxGrid'
  import dateComponent from './components/Date'
  import timeComponent from './components/Time'
  import ContentBlock from './components/ContentBlock'
  import ABNLookup from './components/ABNLookup'
  import Number from './components/Number'
  import Decimal from './components/Decimal'
  import Email from './components/Email'
  import Percent from './components/Percent'
  import PhoneNumber from './components/PhoneNumber'
  import Address from './components/Address'
  import URL from './components/URL'
  import Country from './components/Country'
  import Lookup from './components/Lookup'
  import TriggerMixin from '../TriggerMixin.js'

  export default {
    props: ['question', 'formTemplateId', 'formId', 'index', 'sectionId', 'order', 'hide', 'status'],
    mixins: [TriggerMixin],
    data () {
      return {
        editedName: this.question.question,
        editedDescription: this.question.description,
        questionTypeId: this.question.question_type_id,
        mandatory: !!this.question.mandatory, // got number type
        questionsComponentsMap: {
          'Short answer': shortAnswer,
          'Paragraph': paragraph,
          'Multiple choice': multipleChoice,
          'Checkboxes': checkboxes,
          'Dropdown': dropdown,
          'File upload': fileupload,
          'Linear scale': linearScale,
          'Multiple choice grid': multipleChoiceGrid,
          'Checkbox grid': checkboxGrid,
          'Date': dateComponent,
          'Time': timeComponent,
          'Content Block': ContentBlock,
          'ABN Lookup': ABNLookup,
          'Number': Number,
          'Decimal': Decimal,
          'Email': Email,
          'Percent': Percent,
          'Phone number': PhoneNumber,
          'Address': Address,
          'URL': URL,
          'Country': Country,
          'Lookup': Lookup
        },
        snackbarVisible: false
      }
    },
    computed: {
      answers () {
        const answers = this.question.answers
        if (this.answerSort === 'Alphanumeric Ascending (A-Z)') {
          return _.orderBy(answers, ['parameter', 'answer'], ['desc', 'asc'])
        }
        if (this.answerSort === 'Alphanumeric Descending (Z-A)') {
          return _.orderBy(answers, ['parameter', 'answer'], ['desc', 'desc'])
        }
        if (this.answerSort === 'Number Ascending (1-9)') {
          return _.orderBy(answers, ['parameter', answer => parseInt(answer.answer)], ['desc', 'asc'])
        }
        if (this.answerSort === 'Number Descending (9-1)') {
          return _.orderBy(answers, ['parameter', answer => parseInt(answer.answer)], ['desc', 'desc'])
        }
        return _.orderBy(answers, ['parameter', 'order'], ['desc', 'asc'])
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
      responses () {
        if (!this.formId) {
          return []
        }
        let form = this.$store.getters.loadedForm(this.formTemplateId, parseInt(this.formId))
        return form.responses.filter((response) => {
          return response.question_id === this.question.id && response.order === this.order
        })
      },
      questionTypes () {
        return this.$store.getters.questionTypes
      },
      questionTypeString: {
        get: function () {
          const index = _.findIndex(this.questionTypes, type => {
            return type.id === this.questionTypeId
          })
          if (this.questionTypes[index]) {
            return this.questionTypes[index].type
          } else {
            return 'Short answer'
          }
        },
        set: function (str) {
          this.setQuestionType(str)
        }
      },
      questionComponent: {
        get: function () {
          return this.questionsComponentsMap[this.questionTypeString]
        }
      },
      hasValidation () {
        this.validationTypes = this.$store.getters.validationTypes
        this.validations = this.$store.getters.loadedQuestionValidation(this.formTemplateId, this.question.id)
        return !!(this.validations && this.validations.length && this.validations.length === 1)
      }
    },
    methods: {
      setQuestionType (str) {
        this.questionTypeId = _.findIndex(this.questionTypes, type => {
          return type.type === str
        }) + 1
      },
      createResponse (args) {
        if (!this.formId) {
          return
        }
        const answerId = args[0]
        const response = args[1]
        this.$store.dispatch('createResponse', {
          formId: parseInt(this.formId),
          questionId: this.question.id,
          formTemplateId: this.formTemplateId,
          answerId: answerId,
          response: response,
          order: this.order
        }).then((response) => {
          this.updateForm()
        })
      },
      updateResponse (args) {
        const answerId = args[0]
        const response = args[1]
        const id = args[2]
        this.$store.dispatch('updateResponse', {
          formId: parseInt(this.formId),
          questionId: this.question.id,
          formTemplateId: this.formTemplateId,
          answerId: answerId,
          response: response,
          id: id,
          order: this.order
        }).then((response) => {
          this.updateForm()
        })
      },
      deleteResponse (id) {
        this.$store.dispatch('deleteResponse', {
          formId: parseInt(this.formId),
          questionId: this.question.id,
          formTemplateId: this.formTemplateId,
          id: id
        }).then((response) => {
          this.updateForm()
        })
      },
      updateForm () {
        this.$store.dispatch('updateForm', {
          id: parseInt(this.formId),
          formTemplateId: this.formTemplateId,
          progress: this.progress(parseInt(this.formTemplateId), parseInt(this.formId))
        })
       // this.snackbarVisible = true
      }
    }
  }
</script>

<style scoped>
  .error {
    color: red;
  }
  .question-group .question-head {
    padding-bottom:5px;
  }
  .question-group >>> .input-group.input-group--text-field {
    padding-top:0px;
  }
  .question-group {
    margin-bottom:15px;
  }
  .question-group >>> .input-group__details {
    min-height:auto;
  }
  .question-group >>> .input-group.input-group--textarea {
    padding-top: 0px;
  }
  .question-group >>> .input-group.input-group--textarea .input-group__input {
    border: 1px solid rgba(0,0,0,.42);
    padding: 15px;
  }
</style>