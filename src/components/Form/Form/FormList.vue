<template>
  <v-layout row wrap>
    <v-flex d-flex xs12>
      <v-layout row wrap>
        <v-flex d-flex xs12>
          <h1 class='headline primary--text py-3'>Forms</h1>
          <v-spacer></v-spacer>
          <div class="text-xs-right py-2" v-if="$_userIsApplicationAdmin()">
            <v-tooltip bottom>
              <v-btn icon @click="editMode = !editMode" slot="activator">
                <v-icon>edit</v-icon>
              </v-btn>
              <span>Edit Page</span>
            </v-tooltip>
          </div>
        </v-flex>

        <v-flex d-flex xs12>
          <p>Select an existing form below or <a href='#' @click.stop='createForm = true'>create a new form</a>.</p>
        </v-flex>

        <v-flex>
          <CustomSlot type='formsHeader' :mode="editMode" />
        </v-flex>
        
        <v-flex d-flex xs12 v-if="loading || items.length > 0">
          <DataTable
            title='Forms'
            item-key='id'
            :headers='headers'
            :items='items'
            :loading='loading'
            :pagination='pagination'
            :external-pagination='true'
            @update:pagination='updatePagination'
            @refresh='refreshItems'
            @delete='deleteItems'
            @click='selectItem'
            @create='createItem'
          ></DataTable>
        </v-flex>

        <v-flex d-flex xs12 v-else>
          <Well
            title="You haven't created any forms yet!" 
            message="Let's get started, click here to create your first form"
            icon="assignment"
            @click='createForm = true'
          ></Well>
        </v-flex>

        <v-flex>
          <CustomSlot type='formsFooter' :mode="editMode" />
        </v-flex>
      </v-layout>
    </v-flex>

    <FormCreate v-model='createForm' :slug='this.$_slug'></FormCreate>

  </v-layout>
</template>

<script>
  import ApplicationMixin from '../../../mixins/ApplicationMixin'
  import get from 'lodash/get'
  import { mapGetters } from 'vuex'
  const FormCreate = () => import('./FormCreate')
  const CustomSlot = () => import('../../Layout/CustomSlot')
  const DataTable = () => import('../../DataTable/DataTable')
  const Well = () => import('../../Shared/Well')
  export default {
    name: 'FormList',
    mixins: [ApplicationMixin],
    components: {
      FormCreate,
      CustomSlot,
      DataTable,
      Well
    },
    data () {
      return {
        createForm: false,
        editMode: false,
        loading: false,
        pagination: {
          sortBy: 'updated',
          descending: true,
          rowsPerPage: 25,
          page: 1,
          totalItems: 0,
          from: 1,
          to: 25
        },
        forms: []
      }
    },
    computed: {
      ...mapGetters([
        'formById'
      ]),
      items () {
        let items = []
        this.forms.forEach(form => {
          let item = { ...form }
          item.form_template_id = item.form_template.id
          item.form_template = item.form_template.name
          item.organisation = get(item, 'organisation.name')
          item.email = get(item, 'user.email')
          item.user = get(item, 'user.first_name') + ' ' + get(item, 'user.last_name')
          item.created = this.$_getDateTime(item.created_at)
          item.updated = this.$_getDateTime(item.updated_at)
          items.push(item)
        })
        return items
      },
      headers () {
        let headers = [
          { text: 'Form ID', value: 'id' },
          { text: 'Form Template ID', value: 'form_template_id', visible: false },
          { text: 'Form Template', value: 'form_template' },
          { text: 'Organisation', value: 'organisation' },
          { text: 'User', value: 'user' },
          { text: 'Email', value: 'email' },
          { text: 'Progress', value: 'progress' },
          { text: 'Created', value: 'created', visible: false },
          { text: 'Updated', value: 'updated' },
          { text: 'Status', value: 'status' }
        ]
        return headers
      }
    },
    methods: {
      refreshItems () {
        this.loadData()
      },
      deleteItems (items) {
        items.forEach(item => {
          const formTemplateId = this.formById(item).form_template.id
          this.$store.dispatch('deleteForm', { formTemplateId: formTemplateId, id: item })
          this.loadData()
        })
      },
      selectItem (item) {
        this.$router.push('/forms/' + item)
      },
      createItem () {
        this.createForm = true
      },
      updatePagination (pagination) {
        this.pagination = { ...pagination }
        this.loadData()
      },
      loadData () {
        this.loading = true
        Promise.all([
          this.$store.dispatch('loadAllForms', {
            slug: this.$_slug,
            params: '?limit=' + this.pagination.rowsPerPage + '&page=' + this.pagination.page + '&sortBy=' + this.pagination.sortBy + '&descending=' + this.pagination.descending
          })
          .then(response => {
            this.forms = get(response, 'data.forms')
            this.pagination.totalItems = get(response, 'data.meta.total')
            this.pagination.rowsPerPage = get(response, 'data.meta.per_page')
            this.pagination.page = get(response, 'data.meta.current_page')
            this.pagination.from = get(response, 'data.meta.from')
            this.pagination.to = get(response, 'data.meta.to')
          })
        ]).then(() => {
          this.loading = false
        })
      }
    },
    created: function () {
      this.loadData()
    }
  }
</script>
