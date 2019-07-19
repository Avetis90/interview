<template>
  <v-layout row wrap>
    <v-flex d-flex xs12>
      <v-layout row wrap>

        <!-- //Title -->
        <v-flex d-flex xs12>
          <h1 class="headline primary--text py-3">Form Templates</h1>
        </v-flex>
        <v-flex d-flex xs12>
          <p>Select an existing form template below or <a href="#" @click.stop="createFormTemplate = true">create a new form template</a>.</p>
        </v-flex>

        <!-- //Form template List -->
        <v-flex d-flex xs12>
          <v-flex d-flex xs12>
            <DataTable
              title="Form Templates"
              item-key="id"
              :headers="headers"
              :items="formTemplates"
              :loading="loadingFormTemplates"
              @delete="onDeleteFormTemplate"
              @click="onLoadFormTemplate"
              @create="createFormTemplate = true"
              @refresh="loadData"
            ></DataTable>
          </v-flex>
        </v-flex>

      </v-layout>
    </v-flex>

    <!-- //Create Form Template -->
    <CreateFormTemplate :slug="slug" :visible="createFormTemplate" v-if="userIsApplicationAdmin" @close="createFormTemplate = false"></CreateFormTemplate>
  </v-layout>
</template>

<script>
  import * as _ from 'lodash'
  import moment from 'moment'
  import UserMixin from '../Layout/UserMixin'
  const CreateFormTemplate = () => import('./CreateFormTemplate')
  const DataTable = () => import('../DataTable/DataTable')

  export default {
    data () {
      return {
        slug: window.location.hostname.split('.')[0],
        search: '',
        headers: [
          {text: 'Form Template', value: 'name'},
          {text: 'Forms', value: 'forms_length'},
          {text: 'Status', value: 'status'},
          {text: 'Created', value: 'created_at'}
        ],
        createFormTemplate: false,
        deleteFormTemplate: false,
        loadingFormTemplates: false
      }
    },
    mixins: [UserMixin],
    components: {
      CreateFormTemplate,
      DataTable
    },
    computed: {
      statuses () {
        return this.$store.getters.statuses
      },
      application () {
        return this.$store.getters.loadedApplication(this.slug)
      },
      formTemplates () {
        let formTemplates = _.sortBy(this.$store.getters.loadedFormTemplates(this.slug), element => {
          return element.name.toLowerCase()
        })
        formTemplates.forEach((formTemplate) => {
          const status = this.statuses.find((status) => {
            return status.id === formTemplate.status_id
          })
          formTemplate.status = ((status && status.status === 'Open') ? 'Draft' : 'Published')
          delete formTemplate.sections
        })
        return formTemplates
      },
      fileName () {
        return 'Form Template ' + moment().format('YYYY-MM-DD [at] LTS')
      }
    },
    methods: {
      onLoadFormTemplate (id) {
        this.$router.push('/form-templates/' + id)
      },
      onDeleteFormTemplate (items) {
        items.forEach(item => {
          this.$store.dispatch('deleteFormTemplate', { slug: this.slug, id: item })
        })
        this.loadData()
      },
      loadData () {
        this.loadingFormTemplates = true
        Promise.all([this.$store.dispatch('loadFormTemplates', this.slug)])
        .then(() => {
          this.loadingFormTemplates = false
        })
      }
    },
    created: function () {
      this.loadData()
    },
    filters: {
      moment (date) {
        return moment(date).format('YYYY-MM-DD h:mm A')
      }
    }
  }
</script>
