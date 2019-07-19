<template>

  <v-layout row wrap>
    <v-flex d-flex xs12>
      <v-layout row wrap>
        <v-flex d-flex xs12>
          <h1 class='headline primary--text py-3'>Compare Forms</h1>
          <v-spacer></v-spacer>
        </v-flex>

        <v-flex d-flex xs12>
          <p>Select a form template to compare data from multiple forms.</p>
        </v-flex>

        <!-- // Form Template -->
        <v-layout row wrap>
          <v-flex xs12>
            <v-autocomplete
              :items="formTemplateOptions"
              item-text="text"
              item-value="value"
              v-model="formTemplateId"
              label="Form Template"
              single-line
              @change='loadData'
            >
            </v-autocomplete>
          </v-flex>
        </v-layout>

        <v-flex d-flex xs12>
          <DataTable
            title="Forms"
            item-key="field_form_id"
            :headers="headers"
            :items="items"
            :loading="loading"
            :pagination='pagination'
            :external-pagination='true'
            @update:pagination='updatePagination'
            @refresh='refreshData'
          ></DataTable>
        </v-flex>

      </v-layout>
    </v-flex>

  </v-layout>

</template>

<script>
import * as _ from 'lodash'
import get from 'lodash/get'
import CoreMixin from '../../../mixins/CoreMixin'
const DataTable = () => import('../../DataTable/DataTable.vue')
export default {
  mixins: [ CoreMixin ],
  components: { DataTable },
  data () {
    return {
      loading: false,
      formTemplateId: null,
      pagination: {
        sortBy: 'field_form_id',
        descending: true,
        rowsPerPage: 25,
        page: 1,
        totalItems: 0,
        from: 1,
        to: 25
      },
      items: []
    }
  },
  computed: {
    formTemplates () {
      return _.orderBy(this.$store.getters.formTemplates(this.$_slug), 'name')
    },
    forms () {
      return this.$store.getters.formsByFormTemplateId(this.formTemplateId)
    },
    formTemplateOptions () {
      const options = []
      _.forEach(this.formTemplates, formTemplate => {
        options.push({ text: formTemplate.name, value: formTemplate.id })
      })
      return options
    },
    sections () {
      return _.orderBy(this.$store.getters.sectionsByFormTemplateId(this.formTemplateId), 'order')
    },
    answers () {
      let answers = []
      this.questions.answers.forEach(answer => {
        answers.push(answer)
      })
      return answers
    },
    headers () {
      let data = [
        { text: 'ID', value: 'field_form_id' },
        { text: 'Organisation', value: 'field_organisation' },
        { text: 'Contact', value: 'field_contact' },
        { text: 'Created', value: 'field_created_at' },
        { text: 'Updated', value: 'field_updated_at' },
        { text: 'Completed', value: 'field_completed_at' },
        { text: 'Progress', value: 'field_progress' }
      ]
      this.sections.forEach(section => {
        section.questions.forEach(question => {
          data.push({ text: section.name + ' > ' + question.question, value: 'field_' + question.id })
        })
      })
      return data
    }
  },
  methods: {
    refreshData () {
      this.loadData()
    },
    updatePagination (pagination) {
      this.pagination = { ...pagination }
      this.loadData()
    },
    setItems (forms) {
      console.log(forms)
      let data = []
      _.forEach(forms, form => {
        let row = {
          'field_form_id': form.id,
          'field_organisation': get(form, 'organisation.name'),
          'field_contact': get(form, 'user.first_name') + ' ' + get(form, 'user.last_name'),
          'field_created_at': this.$_formatDateTime(form.created_at),
          'field_updated_at': this.$_formatDateTime(form.updated_at),
          'field_completed_at': this.$_formatDateTime(form.submitted_at),
          'field_progress': form.progress
        }
        _.forEach(this.sections, section => {
          const questions = _.orderBy(section.questions, 'order')
          _.forEach(questions, question => {
            const values = []
            const responses = _.filter(form.responses, response => { return response.question_id === question.id })
            _.forEach(responses, response => {
              const answer = _.find(question.answers, answer => { return response.answer_id === answer.id })
              const value = answer ? answer.answer : response.response
              values.push(value)
            })
            const cell = values.join()
            row['field_' + question.id] = cell
          })
        })
        data.push(row)
      })
      this.items = data
    },
    loadData () {
      if (!this.formTemplateId) {
        return
      }

      this.loading = true
      const payload = {
        form_template_id: this.formTemplateId,
        params: '?page=' + this.pagination.page + '&limit=' + this.pagination.rowsPerPage + '&sortBy=' + this.pagination.sortBy + '&descending=' + this.pagination.descending + '&responses=true'
      }
      this.$store.dispatch('loadedForms', payload)
      .then(response => {
        const pagination = {
          totalItems: get(response, 'data.meta.total'),
          rowsPerPage: get(response, 'data.meta.per_page'),
          page: get(response, 'data.meta.current_page'),
          from: get(response, 'data.meta.from'),
          to: get(response, 'data.meta.to')
        }
        this.pagination = { ...pagination }
        this.setItems(get(response, 'data.forms'))
      })
      .finally(() => {
        this.loading = false
      })
    }
  },
  created () {
    this.$store.dispatch('loadFormTemplates', this.$_slug)
    this.$store.dispatch('loadAllSections', this.$_slug)
  }
}
</script>
