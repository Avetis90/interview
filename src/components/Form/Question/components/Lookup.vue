<template>
  <v-layout row wrap>
    <v-flex xs6 pr-4>
      <v-autocomplete
        v-model="lookupFormTemplateId"
        :items="getFormTemplates()"
        item-text="name"
        item-value="id"
        label="Form Template"
        @change="setQuestions()"
      ></v-autocomplete>
    </v-flex>
    <v-flex xs6>
      <v-autocomplete
        v-model="lookupQuestionId"
        :items="questions"
        item-text="question"
        item-value="id"
        label="Question"
        @change="setLookup()"
      ></v-autocomplete>
    </v-flex>
  </v-layout>
</template>

<script>
  import ApplicationMixin from '../../../../mixins/ApplicationMixin'
  export default {
    name: 'Lookup',
    props: ['questionId', 'sectionId', 'formTemplateId', 'answers'],
    mixins: [ApplicationMixin],
    data () {
      return {
        lookupFormTemplateId: null,
        lookupQuestionId: null,
        questions: []
      }
    },
    computed: {
      answer () {
        return this.answers[0] ? this.answers[0] : null
      }
    },
    methods: {
      getFormTemplates () {
        return this.$_applicationFormTemplates.filter(formTemplate => formTemplate.id !== parseInt(this.formTemplateId))
      },
      setQuestions () {
        this.$store.dispatch('loadSections', this.lookupFormTemplateId)
        .then(() => {
          this.questions = this.$_getFormTemplateQuestions(this.lookupFormTemplateId)
        })
      },
      setLookup () {
        const answer = JSON.stringify({
          formTemplateId: this.lookupFormTemplateId,
          questionId: this.lookupQuestionId
        })
        this.answer ? this.$emit('update-answer', [this.answer.id, answer]) : this.$emit('create-answer', [answer, true])
      }
    },
    created: function () {
      if (this.answer) {
        const value = JSON.parse(this.answer.answer)
        this.lookupFormTemplateId = value.formTemplateId
        this.setQuestions()
        this.lookupQuestionId = value.questionId
      }
    }
  }
</script>