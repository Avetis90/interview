<template>
  <v-layout row wrap>
    <v-flex d-flex xs12>
      <v-layout row wrap>
        <v-flex d-flex xs12>
          <h1 class="headline primary--text py-3">Chart Builder</h1>

          <div class="text-xs-right">
            <v-btn
              icon
              @click="openDialog"
            >
              <v-icon>share</v-icon>
            </v-btn>

            <!-- //Share Link -->
            <v-dialog v-model="joinUrlDialog" max-width="600">
              <v-card>
                <!-- //Title -->
                <v-card-title>
                  <div class="title mb-2 mt-2">Share Chart</div>
                </v-card-title>

                <v-card-text>
                  <v-layout row wrap>
                    <v-flex xs12 pb-3>Share this chart with others or bookmark the chart to view again at a later date using the URL below.</v-flex>
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
          <p>Add filters below to start building your custom chart, each filter will be displayed as a column in the chart and you can add as many filters as you need.</p>
        </v-flex>
        <v-flex d-flex xs12>
          <v-card>

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
              <v-layout row justify-space-between>
                <v-flex xs9 px-3>
                  <v-autocomplete
                    :items="headers"
                    v-model="pieSource"
                    item-text="text"
                    label="Filter"
                  ></v-autocomplete>
                </v-flex>
                <v-flex xs3 px-3>
                  <v-btn block color="success" @click.stop="getResult">Get Result</v-btn>
                </v-flex>
              </v-layout>
            </v-card-title>
            <v-divider></v-divider>

            <!-- // Data -->
            <Pie :chartData="chartData" :options="options" v-if="chart" />

          </v-card>
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
const ReportComponent = () => import('./ReportComponent')
const Pie = () => import('../../Chart/Pie.vue')
export default {
  name: 'ChartBuilder',
  data () {
    return {
      search: '',
      headers: [],
      data: [],
      filters: [],
      filterTemplate: { source: '', query: '', value: '', answer: '' },
      slug: window.location.hostname.split('.')[0],
      joinUrlDialog: false,
      options: {},
      chartData: {},
      chart: false,
      pieSource: null
    }
  },
  mixins: [QuestionCompareMixin, UrlMixin],
  components: {
    ReportComponent,
    Pie
  },
  computed: {
    application () {
      return this.$store.getters.loadedApplication(this.slug)
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
        return window.location.origin + '/chart?filter=' + reportURL.short_url
      }
      return window.location.origin + '/chart'
    }
  },
  methods: {
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
    getResult () {
      this.chart = true
      const data = this.data.map(value => value[this.pieSource])
      const labels = _.uniqBy(data)
      const datasets = []
      const letters = '0123456789ABCDEF'
      const backgroundColor = []
      _.forEach(labels, label => {
        datasets.push(data.filter(value => value === label).length)
        let color = '#'
        for (let i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)]
        }
        backgroundColor.push(color)
      })
      this.chartData = {
        datasets: [{
          data: datasets,
          backgroundColor: backgroundColor
        }],
        labels: labels
      }
    },
    setHeaders () {
      // Replace existing headers with new headers
      this.headers.splice(0, this.headers.length)
      _.forEach(this.filters, (filter, index) => {
        this.headers.push({ text: filter.source.question, value: filter.source.question })
      })
    },
    setData () {
      // Remove existing data
      this.data.splice(0, this.data.length)
      // Filter Forms
      let forms = this.$store.getters.loadedAllForms(this.slug)
      _.forEach(forms, (form, index) => {
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
                response = form.organisation.name
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
            const responses = form.responses.filter((response) => {
              return response.question_id === filter.source.id
            })
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
                break
              }
            }
          }
        })
        if (Object.keys(row).length === this.filters.length + 1) {
          this.data.push(row)
        }
      })
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
