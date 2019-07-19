<template>
  <v-layout row wrap>
    <v-flex d-flex xs12>
      <v-layout row wrap>
        <v-flex d-flex xs12>
          <h1 class="headline primary--text py-3">Organisations</h1>
          <v-spacer></v-spacer>
          <div class="text-xs-right py-2" v-if="userIsApplicationAdmin">
            <v-tooltip bottom>
              <v-btn icon @click="editMode = !editMode" slot="activator">
                <v-icon>edit</v-icon>
              </v-btn>
              <span>Edit Page</span>
            </v-tooltip>
          </div>
        </v-flex>
        <v-flex d-flex xs12>
          <p>Select an existing organisation below or <a href="#" @click.stop="createOrganisation = true">create a new organisation</a>.</p>
        </v-flex>

        <v-flex>
          <CustomSlot type="organisationsHeader" :mode="editMode" />
        </v-flex>


        <v-flex d-flex xs12>
          <v-card>
            <v-card-title>
              <v-layout row wrap>
                <v-flex xs12 md6>
                  <v-btn
                    outline
                  >
                    <download-excel
                      :data="organisations"
                      :name="fileName + '.csv'"
                      type="csv"
                      :fields="json_fields"
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

            <v-data-table
              :headers="headers"
              :items="organisations"
              :search="search"
              :rows-per-page-items="[25, 50, 100, { text: '$vuetify.dataIterator.rowsPerPageAll', value: -1 }]"

            >
              <template slot="items" slot-scope="props">
                <td @click='onLoadOrganisation(props.item.id)' >{{ props.item.name }}</td>
                <td @click='onLoadOrganisation(props.item.id)' >{{ props.item.active_users_length }}</td>
                <td @click='onLoadOrganisation(props.item.id)' >{{ props.item.invited_users_length }}</td>
                <td @click='onLoadOrganisation(props.item.id)' >{{ props.item.forms_length }}</td>
                <td @click='onLoadOrganisation(props.item.id)' >{{ props.item.created_at | moment }}</td>
                <td>
                  <v-tooltip bottom>
                    <v-btn icon class='mx-0' @click='showDeleteOrganisation(props.item.id)' slot="activator">
                      <v-icon color='pink'>delete</v-icon>
                    </v-btn>
                    <span>Delete</span>
                  </v-tooltip>
                </td>
              </template>
              <v-alert slot="no-results" :value="true" color="error" icon="warning">
                Your search for "{{ search }}" found no results.
              </v-alert>
            </v-data-table>
          </v-card>
        </v-flex>

        <v-flex>
          <CustomSlot type="organisationsFooter" :mode="editMode" />
        </v-flex>

      </v-layout>
    </v-flex>

    <v-tooltip top>
      <v-btn slot="activator" fixed dark bottom right fab router class="error" @click.stop="createOrganisation = true">
        <v-icon>add</v-icon>
      </v-btn>
      <span>Create Organisation</span>
    </v-tooltip>

    <!-- //Create Organisation -->
    <CreateOrganisation :visible="createOrganisation" :slug="slug" @close="createOrganisation = false"></CreateOrganisation>

    <!-- //Delete Organisation -->
    <DeleteConfirmDialog @delete-action="onDeleteOrganisation" :visible="deleteOrganisation" @close="deleteOrganisation = false"></DeleteConfirmDialog>

  </v-layout>
</template>


<script>
  import * as _ from 'lodash'
  import moment from 'moment'
  import UserMixin from '../Layout/UserMixin'
  const CreateOrganisation = () => import('./CreateOrganisation')
  const CustomSlot = () => import('../Layout/CustomSlot')
  export default {
    data () {
      return {
        json_fields: {
          'Organisation': 'name',
          'Active Users': 'active_users_length',
          'Invited Users': 'invited_users_length',
          'Forms': 'forms_length',
          'Created': {
            field: 'created_at',
            callback: (value) => {
              return moment(value).format('YYYY-MM-DD h:mm A')
            }
          }
        },
        createOrganisation: false,
        slug: window.location.hostname.split('.')[0],
        search: '',
        selectedId: 0,
        headers: [
          {text: 'Organisation', value: 'name'},
          {text: 'Active Users', value: 'active_users_length'},
          {text: 'Invited Users', value: 'invited_users_length'},
          {text: 'Forms', value: 'forms_length'},
          {text: 'Created', value: 'created_at'},
          {text: 'Actions', value: 'Actions'}
        ],
        deleteOrganisation: false,
        editMode: false
      }
    },
    mixins: [UserMixin],
    components: {
      CreateOrganisation,
      CustomSlot
    },
    computed: {
      organisations () {
        return _.sortBy(this.$store.getters.loadedOrganisations(this.slug), element => {
          return element.name.toLowerCase()
        })
      },
      fileName () {
        return 'Organisations ' + moment().format('YYYY-MM-DD [at] LTS')
      }
    },
    methods: {
      onLoadOrganisation (id) {
        this.$router.push('/organisations/' + id)
      },
      showDeleteOrganisation (id) {
        this.selectedId = id
        this.deleteOrganisation = true
      },
      onDeleteOrganisation () {
        this.$store.dispatch('deleteOrganisation', {
          slug: this.slug,
          id: this.selectedId
        })
      }
    },
    created: function () {
      this.$store.dispatch('loadOrganisations', this.slug)
    },
    filters: {
      moment: function (date) {
        return moment(date).format('YYYY-MM-DD h:mm A')
      }
    }
  }
</script>
