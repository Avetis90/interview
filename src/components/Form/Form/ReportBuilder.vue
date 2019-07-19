<template>
  <v-layout row wrap>
    <v-flex d-flex xs12>
      <v-layout row wrap>
        <v-flex d-flex xs12>
          <h1 class="headline primary--text py-3">Report Builder</h1>
          <v-spacer></v-spacer>
          <div class="text-xs-right py-2">
            <v-tooltip bottom>
              <v-btn icon @click="editMode = !editMode" v-if="userIsApplicationAdmin" slot="activator">
                <v-icon>edit</v-icon>
              </v-btn>
              <span>Edit Page</span>
            </v-tooltip>
            <v-tooltip bottom>
              <v-btn
                icon
                @click="openDialog"
                slot="activator"
              >
                <v-icon>share</v-icon>
              </v-btn>
              <span>Share Report</span>
            </v-tooltip>

            <!-- //Share Link -->
            <v-dialog v-model="joinUrlDialog" max-width="600">
              <v-card>
                <!-- //Title -->
                <v-card-title>
                  <div class="title mb-2 mt-2">Share Report</div>
                </v-card-title>

                <v-card-text>
                  <v-layout row wrap>
                    <v-flex xs12 pb-3>Share this report with others or bookmark the report to view again at a later date using the URL below.</v-flex>
                    <v-flex xs12 class="wrap-text">{{ reportURL }}</v-flex>
                  </v-layout>
                </v-card-text>

                <v-divider></v-divider>
                <v-card-actions>
                  <v-layout row py-2>
                    <v-flex xs12 class="text-xs-right">
                      <v-btn color="primary" @click="joinUrlDialog = false" >Close</v-btn>
                    </v-flex>
                  </v-layout>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </div>
        </v-flex>
        <v-flex d-flex xs12>
          <p>Add filters below to start building your custom report, each filter will be displayed as a column in the report and you can add as many filters as you need.</p>
        </v-flex>

        <v-flex>
          <CustomSlot type="reportHeader" :mode="editMode" />
        </v-flex>
        <v-flex d-flex xs12>
          <v-card style="width: 100%">

            <v-card-title>
              <div class="title">Filters</div>
              <v-container>

                <template v-for="(filter, index) in filters">

                  <ReportComponent
                    :filter="filter"
                    @deleteFilter="deleteFilter"
                    :key="'filter' + index"
                    :index="index"
                  />
                </template>

                <!-- // Action Buttons -->
                <v-layout row justify-center>
                  <v-flex xs3 px-3>
                    <v-btn block color="primary" @click.stop="addFilter">Add Filter</v-btn>
                  </v-flex>
                  <v-flex xs3 px-3>
                    <v-btn block color="success" @click.stop="applyFilters">Apply Filters</v-btn>
                  </v-flex>
                </v-layout>
              </v-container>

            </v-card-title>
            <v-divider></v-divider>

            <v-card-title>
              <v-layout row wrap>
                <v-flex xs12 md6>
                  <v-btn
                    outline
                  >
                    <download-excel
                      :data="data"
                      :name="fileName + '.csv'"
                      type="csv"
                    >
                      Export
                    </download-excel>
                  </v-btn>
                </v-flex>
                <v-flex xs12 md6>
                  <v-text-field
                    v-model="search"
                    append-icon="search"
                    label="Search"
                    single-line
                    hide-details
                  ></v-text-field>
                </v-flex>
              </v-layout>
            </v-card-title>

            <!-- // Data -->
            <v-data-table
              :headers="headers"
              :items="data"
              :search="search"
              :pagination.sync="pagination"
            >
              <template slot="items" slot-scope="props">
                <tr @click="onForm(props.item.ID)">
                  <template v-for="(item, key) in props.item">
                    <td v-bind:key="'filter'+key" v-if="key != 'ID'">{{item}}</td>
                  </template>
                </tr>
              </template>
              <template slot="footer">
                <template v-for="(item, key) in headers">
                  <td v-bind:key="'filter'+key" v-if="key != 'ID'">{{footer(item)}}</td>
                </template>
              </template>
              <v-alert slot="no-results" :value="true" color="error" icon="warning">
                Your filters returned no results. Try changing your filters.
              </v-alert>
              <v-alert slot="no-data" :value="true" color="error" icon="warning">
                Your filters returned no results. Try changing your filters.
              </v-alert>
            </v-data-table>

          </v-card>
        </v-flex>

        <v-flex>
          <CustomSlot type="reportFooter" :mode="editMode" />
        </v-flex>
      </v-layout>
    </v-flex>

  </v-layout>
</template>

<script>
import * as _ from 'lodash'
import moment from 'moment'
import QuestionCompareMixin from './QuestionCompareMixin.js'
import UrlMixin from './UrlMixin.js'
import UserMixin from '../../Layout/UserMixin'
const CustomSlot = () => import('../../Layout/CustomSlot')
const ReportComponent = () => import('./ReportComponent')
export default {
  name: 'ReportBuilder',
  data () {
    return {
      search: '',
      headers: [],
      data: [],
      filters: [],
      filterTemplate: { source: '', query: '', value: '', answer: '' },
      slug: window.location.hostname.split('.')[0],
      joinUrlDialog: false,
      pagination: {
        rowsPerPage: -1
      },
      editMode: false
    }
  },
  mixins: [QuestionCompareMixin, UrlMixin, UserMixin],
  components: {
    ReportComponent,
    CustomSlot
  },
  computed: {
    application () {
      return this.$store.getters.loadedApplication(this.slug)
    },
    fileName () {
      return this.application.name + ' Report ' + moment().format('YYYY-MM-DD [at] LTS')
    },
    user () {
      return this.$store.getters.user
    },
    questions () {
      return this.$store.getters.loadedApplicationQuestions(this.slug)
    },
    reportURL () {
      const reportURL = this.$store.getters.reportURL
      if (reportURL) {
        return window.location.origin + '/report?filter=' + reportURL.short_url
      }
      return window.location.origin + '/report'
    }
  },
  methods: {
    onForm (id) {
      this.$router.push('/forms/' + id)
    },
    openDialog () {
      if (this.filters.length && this.filters[0].source) {
        this.createUrl(JSON.stringify(this.filters))
      }
      this.joinUrlDialog = true
    },
    jsonCopy (src) {
      return JSON.parse(JSON.stringify(src))
    },
    date (value) {
      return value ? moment(value).format('YYYY-MM-DD h:mm A') : value
    },
    deleteFilter (index) {
      this.filters.splice(index, 1)
    },
    addFilter () {
      const newFilter = this.jsonCopy(this.filterTemplate)
      this.filters.push(newFilter)
    },
    applyFilters () {
      this.setHeaders()
      this.setData()
    },
    setHeaders () {
      // Replace existing headers with new headers
      this.headers.splice(0, this.headers.length)
      _.forEach(this.filters, (filter, index) => {
        this.headers.push({ text: filter.source.question, value: filter.source.question, option: filter.source })
      })
    },
    setData () {
      // Remove existing data
      this.data.splice(0, this.data.length)
      // Filter Forms
      let forms = this.$store.getters.loadedAllForms(this.slug)
      _.forEach(forms, (form, index) => {
        let linkedResponses = []
        let row = {}
        row['ID'] = form.id
        _.forEach(this.filters, filter => {
          if (!filter.source) {
            return
          }
          if (filter.source.group === 'Form Detail') {
            let response = ''
            switch (filter.source.question) {
              case 'Form Template':
                response = form.form_template.name
                break
              case 'Owner':
                response = form.user.first_name + ' ' + form.user.last_name
                break
              case 'Owner Email':
                response = form.user.email
                break
              case 'Organisation':
                response = form.organisation ? form.organisation.name : ''
                break
              case 'Progress':
                response = form.progress
                break
              case 'Period Start':
                response = this.date(form.period_start)
                break
              case 'Period End':
                response = this.date(form.period_end)
                break
              case 'Status':
                response = this.getStatus(form.status_id)
                break
              case 'Created':
                response = this.date(form.created_at)
                break
              case 'Modified':
                response = this.date(form.updated_at)
                break
            }
            // Question, Responses, ComparatorID, QuestionTrigger.answer, QuestionTrigger.value
            const question = {question_type_id: 1, answers: []}
            const responses = [{answer_id: null, response: response}]
            if (filter.query !== '') {
              const compareResult = this.compareResponse(question, responses, filter.query, filter.answer, filter.value)
              if (compareResult) {
                row[filter.source.question] = response
              }
            } else {
              row[filter.source.question] = response
            }
          } else {
            const question = this.questions.find((question) => {
              return question.id === filter.source.id
            })
            let responses = form.responses.filter((response) => {
              return response.question_id === filter.source.id
            })
            if (!responses.length) {
              responses = linkedResponses.filter((response) => {
                return response.question_id === filter.source.id
              })
            }
            const questionType = this.getQuestionType(question.question_type_id)
            let order = 1
            if (responses.length) {
              order = Math.max(...responses.map(response => response.order))
            }
            for (let i = 1; i <= order; i++) {
              const orderResponses = responses.filter((response) => {
                return response.order === i
              })
              if (filter.query !== '') {
                const compareResult = this.compareResponse(question, orderResponses, filter.query, filter.answer, filter.value)
                if (compareResult) {
                  row[filter.source.question] = this.questionToResponse(question, orderResponses)
                  break
                }
              } else {
                row[filter.source.question] = this.questionToResponse(question, orderResponses)
                if (questionType === 'Lookup' && orderResponses.length) {
                  if (question.answers.length) {
                    const value = JSON.parse(question.answers[0].answer)
                    const editFormTemplateId = value.formTemplateId
                    if (editFormTemplateId) {
                      const editQuestionId = value.questionId
                      const editQuestion = this.$store.getters.loadedAllQuestion(editFormTemplateId, editQuestionId)
                      const forms = this.$store.getters.loadedForms(editFormTemplateId)
                      const questionResponses = []
                      _.forEach(forms, (form, index) => {
                        const formResponses = form.responses.filter(response => response.question_id === editQuestionId)
                        _.forEach(formResponses, (formResponse, index) => {
                          const response = this.questionToResponse(editQuestion, [formResponse])
                          questionResponses.push({id: formResponse.id, response: response, form_id: form.id})
                        })
                      })
                      const lookupResult = questionResponses.find(questionResponse => questionResponse.form_id === parseInt(orderResponses[0].response))
                      const lookupForm = lookupResult ? forms.find(form => lookupResult.form_id === form.id) : null
                      linkedResponses = lookupForm ? linkedResponses.concat(lookupForm.responses) : null
                      row[filter.source.question] = lookupResult ? lookupResult.response : ''
                    }
                  }
                }
                break
              }
            }
          }
        })
        if (Object.keys(row).length === this.filters.length + 1) {
          this.data.push(row)
        }
      })
    },
    footer (item) {
      if (!item.option.id) {
        return ''
      }

      const question = this.questions.find((question) => {
        return question.id === item.option.id
      })
      const questionType = this.getQuestionType(question.question_type_id)

      if (questionType !== 'Number' && questionType !== 'Decimal') {
        return ''
      }
      const sum = _.sumBy(this.data, value => parseFloat(value[item.value]))
      return 'sum = ' + sum + ', avg = ' + Math.floor(sum / this.data.length)
    }
  },
  created: function () {
    if (this.user) {
      this.getUrl()
      this.$store.dispatch('loadAllForms', this.slug)
      this.$store.dispatch('loadFormTemplates', this.slug)
      this.$store.dispatch('loadAllSections', this.slug)
    }
  }
}
</script>