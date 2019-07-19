<template>
  <v-container fluid grid-list-lg class="dashboard-container">
    <WelcomeCard></WelcomeCard>

    <!-- // Stats -->
    <v-layout row wrap justify-space-between>
      <v-flex
        v-for="item in items"
        :key="item.name"
        sm12 md3>
        <v-card :color="item.color">
          <v-container fluid grid-list-lg>
            <v-layout row>
              <v-flex>
                <v-icon size="65" >{{ item.icon }}</v-icon>
              </v-flex>
              <v-flex text-xs-right class="white--text">
                <div class="display-2" color="white">
                  <countTo :startVal="countToStart" :endVal="getNumberOfForms(item.form)" :duration="countToDuration"></countTo>
                </div>
                <div class="body-1">{{ item.label }}</div>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card>
      </v-flex>
    </v-layout>

    <v-layout row>
      <v-flex xs12>
        <v-tabs
          slider-color="white"
          color="primary"
          dark
          grow
          class="user-profile-tabs"
        >
          <template v-for="item in items">
            <v-tab
              :href="'#' + item.form"
              v-bind:key="item.form"
            >
            {{ item.label }}
            </v-tab>
            <v-tab-item
              :value="item.form"
              v-bind:key="item.form"
            >
            <DataTable
              :title="item.label"
              item-key='id'
              :headers="item.headers"
              :items="(item.items)"
              :loading="loading"
              :pagination="item.pagination"
              @update:pagination='updatePagination'
              @refresh="loadFormsByName(item.form)"
              @click='selectItem'
            ></DataTable>
            </v-tab-item>
          </template>
        </v-tabs>
      </v-flex>
    </v-layout>

    <!-- // Action Buttons -->
    <v-layout justify-space-between row wrap v-if="this.isAdmin">
      <v-flex xs12 md6>
        <ApplicationExportButton :slug="$_slug"></ApplicationExportButton>
      </v-flex>
      <v-flex xs12 md6>
        <FormUploadButton :slug="$_slug" />
      </v-flex>
    </v-layout>
    
  </v-container>
</template>

<script>
  import countTo from 'vue-count-to'
  import { mapGetters } from 'vuex'
  import get from 'lodash/get'
  import sortBy from 'lodash/sortBy'
  import responseMixin from '../Form/ResponseMixin'
  const WelcomeCard = () => import('./Components/WelcomeCard')
  const FormUploadButton = () => import('./Components/FormUploadButton')
  const ApplicationExportButton = () => import('./Components/ApplicationExportButton')
  const DataTable = () => import('../DataTable/DataTable')
  export default {
    components: {
      WelcomeCard,
      FormUploadButton,
      ApplicationExportButton,
      DataTable,
      countTo
    },
    mixins: [responseMixin],
    data () {
      return {
        loading: false,
        countToStart: 0,
        countToDuration: 3000,
        timer: null,
        items: [
          {
            form: 'Site',
            label: 'Sites',
            icon: 'place',
            color: 'blue',
            pagination: {
              rowsPerPage: 25,
              page: 1
            },
            headers: [],
            items: []
          },
          {
            form: 'Service',
            label: 'Services',
            icon: 'ev_station',
            color: 'orange',
            pagination: {
              rowsPerPage: 25,
              page: 1
            },
            headers: [],
            items: []
          },
          {
            form: 'Vehicle',
            label: 'Vehicles',
            icon: 'directions_car',
            color: 'green',
            pagination: {
              rowsPerPage: 25,
              page: 1
            },
            headers: [],
            items: []
          },
          {
            form: 'Usage',
            label: 'Usage',
            icon: 'trending_up',
            color: 'red',
            pagination: {
              rowsPerPage: 25,
              page: 1
            },
            headers: [],
            items: []
          }
        ]
      }
    },
    computed: {
      ...mapGetters([
        'user',
        'userIsSuperAdmin',
        'userIsAdmin',
        'formTemplateByName',
        'formTemplateById',
        'formsByFormTemplateId',
        'questionTypeById'
      ]),
      isAdmin () {
        return this.userIsSuperAdmin || this.userIsAdmin(this.$_slug, this.user.id)
      }
    },
    methods: {
      getNumberOfForms (formTemplateName) {
        return get(this.formTemplateByName(this.$_slug, formTemplateName), 'forms_length')
      },
      setHeaders (formTemplateName) {
        const formTemplate = this.formTemplateByName(this.$_slug, formTemplateName)
        let headers = []
        headers.push({ text: 'ID', value: 'id' })
        sortBy(formTemplate.sections, ['order']).forEach(section => {
          sortBy(section.questions, ['order']).forEach(question => {
            headers.push({ text: question.question, value: question.id.toString() })
          })
        })
        const index = this.items.findIndex(i => i.form === formTemplateName)
        this.items.splice(index, 1, { ...this.items[index], ...{ headers: headers } })
      },
      setItems (formTemplateName, forms) {
        const formTemplate = this.formTemplateByName(this.$_slug, formTemplateName)
        let items = []
        forms.forEach(form => {
          let item = {}
          item.id = form.id
          form.responses.forEach(response => {
            const question = this.getQuestionById(formTemplate.id, response.question_id)
            if (question) {
              question.question_type = this.questionTypeById(question.question_type_id).type
              item[response.question_id.toString()] = this.formatResponse(question, form.responses)
            }
          })
          items.push(item)
        })
        const index = this.items.findIndex(i => i.form === formTemplateName)
        this.items.splice(index, 1, { ...this.items[index], ...{ items: items } })
      },
      getQuestionById (formTemplateId, questionId) {
        const formTemplate = this.formTemplateById(this.$_slug, formTemplateId)
        return [].concat(formTemplate.sections).shift().questions.find(q => q.id === questionId)
      },
      updatePagination (pagination, label) {
        const index = this.items.findIndex(i => i.label === label)
        this.items.splice(index, 1, { ...this.items[index], ...{ pagination: { ...pagination } } })
        this.loadFormsByName(this.items[index].form)
      },
      selectItem (item) {
        this.$router.push('/forms/' + item)
      },
      loadData (form) {
        this.loading = true
        Promise.all([
          this.$store.dispatch('loadQuestionTypes'),
          this.$store.dispatch('loadFormTemplates', this.$_slug),
          this.$store.dispatch('loadAllSections', this.$_slug)
        ])
        .then(() => {
          this.items.forEach(item => {
            this.setHeaders(item.form)
            this.loadFormsByName(item.form)
          })
        })
        .finally(() => {
          this.loading = false
        })
      },
      loadFormsByName (formTemplateName) {
        const formTemplate = this.formTemplateByName(this.$_slug, formTemplateName)
        if (!formTemplate) {
          return
        }
        const index = this.items.findIndex(i => i.form === formTemplateName)
        const pagination = this.items[index].pagination
        this.loading = true
        const payload = {
          form_template_id: formTemplate.id,
          params: '?page=' + pagination.page + '&limit=' + pagination.rowsPerPage + '&sortBy=' + pagination.sortBy + '&descending=' + pagination.descending + '&responses=true'
        }
        this.$store.dispatch('loadFormTemplates', this.$_slug)
        .then(() => this.$store.dispatch('loadedForms', payload))
        .then(response => {
          const pagination = {
            totalItems: get(response, 'data.meta.total'),
            rowsPerPage: get(response, 'data.meta.per_page'),
            page: get(response, 'data.meta.current_page'),
            from: get(response, 'data.meta.from'),
            to: get(response, 'data.meta.to')
          }
          this.items.splice(index, 1, { ...this.items[index], ...{ pagination: pagination } })
          this.setItems(formTemplateName, get(response, 'data.forms'))
        })
        .finally(() => {
          this.loading = false
        })
      }
    },
    created () {
      this.loadData()
    }
  }
</script>

<style scoped>
  .dashboard-container {
    padding: 0px;
  }
  .stat-component:not(:last-child) {
    border-right: thin #8080803d solid;
  }
</style>