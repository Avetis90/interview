<template>
  <v-layout row wrap v-if='organisation'>
    <v-flex d-flex xs12>
      <v-layout row wrap>
        <v-flex d-flex xs12>
          <h1 class="headline primary--text py-3">{{ organisation.name }}</h1>
          <div class="text-xs-right">
            <v-menu offset-y bottom left v-if="isOrganisationAdmin">
              <v-btn icon slot="activator">
                <v-icon>more_vert</v-icon>
              </v-btn>

              <v-list>
                <v-list-tile @click="">
                  <v-list-tile-avatar>
                    <v-icon>edit</v-icon>
                  </v-list-tile-avatar>
                  <v-list-tile-content>
                    <EditOrganisation :organisation="organisation" :slug="slug" class="my-1"></EditOrganisation>
                  </v-list-tile-content>
                </v-list-tile>

                <v-list-tile @click.stop="deleteOrganisation = true">
                  <v-list-tile-avatar>
                    <v-icon>delete</v-icon>
                  </v-list-tile-avatar>
                  <v-list-tile-content>
                    Delete Organisation
                  </v-list-tile-content>
                </v-list-tile>
              </v-list>
            </v-menu>
          </div>
        </v-flex>
        <v-flex d-flex xs12>
          <v-card>
            <v-tabs dark grow slider-color="white" color="info">
              <v-tab href="#users_tab">Users</v-tab>
              <v-tab href="#forms_tab">Forms</v-tab>
              <v-tab-item value="users_tab">

                <!-- //User Search -->
                <v-card-title>
                  <v-layout row wrap>
                    <v-flex xs12 md6>
                      <v-btn
                        outline
                      >
                        <download-excel
                          :data="users"
                          :name="userFileName + '.csv'"
                          type="csv"
                          :fields="userFields"
                        >
                          Export
                        </download-excel>

                      </v-btn>
                    </v-flex>
                    <v-flex xs12 md6>
                      <v-text-field
                        v-model="userSearch"
                        append-icon="search"
                        label="Search"
                        single-line
                        hide-details
                      ></v-text-field>
                    </v-flex>
                  </v-layout>
                </v-card-title>

                <!-- //Users -->
                <v-data-table
                  :headers="userHeaders"
                  :items="users"
                  :search="userSearch"
                  key="users_table"
                  :rows-per-page-items="[25, 50, 100, { text: '$vuetify.dataIterator.rowsPerPageAll', value: -1 }]"
                >
                  <template slot="items" slot-scope="props">
                    <td>{{ props.item.first_name }}</td>
                    <td>{{ props.item.last_name }}</td>
                    <td>{{ props.item.email }}</td>
                    <td>{{ props.item.role }}</td>
                    <td>{{ props.item.status }}</td>
                    <td>{{ props.item.created_at | moment }}</td>
                    <td v-if='isOrganisationAdmin' class="justify-center layout px-0">
                      <v-tooltip bottom>
                        <EditOrganisationUser :user="props.item" :slug="slug" :organisationId="id" slot="activator" v-if="props.item.status === 'Joined'"></EditOrganisationUser>
                        <EditInvitedOrganisationUser :user="props.item" :slug="slug" :organisationId="id" slot="activator" v-if="props.item.status === 'Invited'"></EditInvitedOrganisationUser>
                        <span>Edit</span>
                      </v-tooltip>
                      <v-tooltip bottom>
                        <v-btn icon class="mx-0" @click="onDeleteOrganisationUser(props.item.id, props.item.status)" slot="activator">
                          <v-icon color="pink">delete</v-icon>
                        </v-btn>
                        <span>Delete</span>
                      </v-tooltip>
                    </td>
                  </template>
                  <v-alert slot="no-results" :value="true" color="error" icon="warning">
                    Your search for "{{ userSearch }}" found no results.
                  </v-alert>
                </v-data-table>
              </v-tab-item>
              <v-tab-item value="forms_tab">
                <v-card-title>
                  <v-layout row wrap>
                    <v-flex xs12 md6>
                      <v-btn
                        outline
                      >
                        <download-excel
                          :data="forms"
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

                <!-- //Forms -->
                <v-data-table
                    :headers='headers'
                    :items='forms'
                    :search='search'
                    :rows-per-page-items="[25, 50, 100, { text: '$vuetify.dataIterator.rowsPerPageAll', value: -1 }]"
                    :loading="loadingForms"
                    key="form_table"
                >
                  <template slot='items' slot-scope='props'>
                    <tr>
                      <td @click='onForm(props.item.id)'>{{ props.item.form_template_name }}</td>
                      <td @click='onForm(props.item.id)'>{{ props.item['Owner'] }}</td>
                      <td @click='onForm(props.item.id)'>{{ props.item['Owner Email'] }}</td>
                      <td @click='onForm(props.item.id)'>{{ props.item['Created'] }}</td>
                      <td @click='onForm(props.item.id)'>{{ props.item['Modified'] }}</td>
                      <td @click='onForm(props.item.id)'>{{ props.item['Progress'] }}</td>
                      <td @click='onForm(props.item.id)'>{{ props.item['status'] }}</td>
                    </tr>
                  </template>
                  <v-alert slot='no-results' :value='true' color='error' icon='warning'>
                    Your search for '{{ search }}' found no results.
                  </v-alert>
                </v-data-table>
              </v-tab-item>
            </v-tabs>

          </v-card>
        </v-flex>
      </v-layout>
    </v-flex>

    <v-tooltip top v-if="isOrganisationAdmin">
      <v-btn slot="activator" fixed dark bottom right fab router class="error" @click.stop="inviteUsers = true">
        <v-icon>add</v-icon>
      </v-btn>
      <span>Invite Users</span>
    </v-tooltip>

    <!-- //Invite Organisation -->
    <InviteOrganisation :slug="slug" :organisationId="id" :visible="inviteUsers" @close="inviteUsers = false"></InviteOrganisation>

    <!-- //Delete Organisation -->
    <DeleteConfirmDialog @delete-action="onDeleteOrganisation" :visible="deleteOrganisation" @close="deleteOrganisation = false"></DeleteConfirmDialog>
  </v-layout>
</template>

<script>
  import moment from 'moment'
  import LayoutMixin from '../Layout/LayoutMixin'
  import UserMixin from '../Layout/UserMixin'
  const InviteOrganisation = () => import('./InviteOrganisation')
  const EditOrganisation = () => import('./EditOrganisation')
  const EditOrganisationUser = () => import('./EditOrganisationUser')
  const EditInvitedOrganisationUser = () => import('./EditInvitedOrganisationUser')
  export default {
    props: ['id'],
    data () {
      return {
        userFields: {
          'First Name': 'first_name',
          'Last Name': 'last_name',
          'Email': 'email',
          'Role': 'role',
          'Joined / Invited': {
            field: 'created_at',
            callback: (value) => {
              return moment(value).format('YYYY-MM-DD h:mm A')
            }
          },
          'Status': 'status'
        },
        userSearch: '',
        inviteUsers: false,
        deleteOrganisation: false,
        search: '',
        loadingForms: false,
        headers: [
          {
            text: 'Form Template',
            value: 'form_template_name',
            sortable: true,
            align: 'left'
          },
          {
            text: 'Owner',
            value: 'Owner'
          },
          {
            text: 'Owner Email',
            value: 'Owner Email'
          },
          {
            text: 'Created',
            value: 'Created'
          },
          {
            text: 'Modified',
            value: 'Modified'
          },
          {
            text: 'Progress',
            value: 'Progress'
          },
          {
            text: 'Status',
            value: 'status'
          }
        ]
      }
    },
    components: {
      InviteOrganisation,
      EditOrganisation,
      EditOrganisationUser,
      EditInvitedOrganisationUser
    },
    mixins: [LayoutMixin, UserMixin],
    computed: {
      organisation () {
        return this.$store.getters.loadedOrganisation(this.slug, parseInt(this.id))
      },
      isOrganisationAdmin () {
        return this.userIsAdmin || this.isSuperUser
      },
      activeUsers () {
        let users = this.$store.getters.loadedOrganisationUsers(parseInt(this.id))
        users.forEach((user) => {
          user.role = this.getRole(user.organisation_role_id)
          user.status = 'Joined'
        })
        return users
      },
      invitedUsers () {
        let invitedUsers = this.$store.getters.invitedOrganisationUsers(parseInt(this.id))
        invitedUsers.forEach((invitedUser) => {
          invitedUser.role = this.getRole(invitedUser.organisation_role_id)
          invitedUser.status = 'Invited'
        })
        return invitedUsers
      },
      users () {
        let users = []
        this.activeUsers.forEach(user => { users.push(user) })
        this.invitedUsers.forEach(user => { users.push(user) })
        return users
      },
      userHeaders () {
        let defaultUserHeaders = [
          { text: 'First Name', value: 'first_name', sortable: true, align: 'left' },
          { text: 'Last Name', value: 'last_name', sortable: true, align: 'left' },
          { text: 'Email', value: 'email', sortable: true, align: 'left' },
          { text: 'Role', value: 'role', sortable: true, align: 'left' },
          { text: 'Status', value: 'status', sortable: true, align: 'left' },
          { text: 'Joined/Invited', value: 'created_at', sortable: true, align: 'left' }
        ]
        if (this.isOrganisationAdmin) {
          defaultUserHeaders.push({ text: 'Action', sortable: false, align: 'center' })
        }
        return defaultUserHeaders
      },
      user () {
        return this.$store.getters.user
      },
      userFileName () {
        return 'Users ' + moment().format('YYYY-MM-DD [at] LTS')
      },
      questions () {
        return this.$store.getters.loadedApplicationQuestions(this.slug)
      },
      forms () {
        let forms = this.$store.getters.loadedAllForms(this.slug)
        forms = forms.filter(form => {
          return form.organisation && form.organisation.id === this.organisation.id
        })
        forms.forEach((form) => {
          form.owner = form.organisation ? form.organisation.name : form.user.first_name + ' ' + form.user.last_name
          form.status = this.status(form.status_id)
          form.form_template_name = form.form_template.name
          form['Owner'] = form.user ? (form.user.first_name + ' ' + form.user.last_name) : ''
          form['Owner Email'] = form.user ? form.user.email : ''
          form['Organisation'] = form.organisation ? form.organisation.name : ''
          form['Progress'] = form.progress
          form['Period Start'] = this.date(form.period_start)
          form['Period End'] = this.date(form.period_end)
          form['Created'] = this.date(form.created_at)
          form['Modified'] = this.date(form.updated_at)
        })
        return forms
      },
      statuses () {
        return this.$store.getters.statuses
      },
      fileName () {
        return 'Forms ' + moment().format('YYYY-MM-DD [at] LTS')
      }
    },
    methods: {
      onDeleteOrganisation () {
        this.$store.dispatch('deleteOrganisation', {
          slug: this.slug,
          id: this.organisation.id
        })
        this.$router.push('/organisations')
      },
      onDeleteOrganisationUser (organisationUserId, status) {
        if (status === 'Joined') {
          this.$store.dispatch('deleteOrganisationUser', {
            slug: this.slug,
            organisationId: this.organisation.id,
            id: organisationUserId
          })
            .then(() => {
              if (this.user.id === organisationUserId) {
                this.$store.dispatch('loadOrganisations', this.slug)
                  .then(() => {
                    this.$router.push('/organisations')
                  })
              }
            })
        } else {
          this.$store.dispatch('deleteInvitedOrganisationUser', {
            slug: this.slug,
            organisationId: this.organisation.id,
            id: organisationUserId
          })
        }
      },
      onForm (id) {
        this.$router.push('/forms/' + id)
      },
      date (value) {
        if (!value) {
          return value
        }
        return moment(value).format('YYYY-MM-DD h:mm A')
      },
      status (id) {
        return this.statuses.find(e => { return e.id === id }).status
      }
    },
    created: function () {
      if (this.user) {
        this.loadingForms = true
        Promise.all([
          this.$store.dispatch('loadUsers', this.slug),
          this.$store.dispatch('loadOrganisations', this.slug),
          this.$store.dispatch('loadOrganisationUsers', {slug: this.slug, organisationId: this.id}),
          this.$store.dispatch('loadFormTemplates', this.slug),
          this.$store.dispatch('loadAllSections', this.slug),
          this.$store.dispatch('loadAllForms', this.slug),
          this.$store.dispatch('loadAllOrganisationUsers', this.slug)]
        ).then(() => {
          this.loadingForms = false
        })
      }
    },
    filters: {
      moment: function (date) {
        return date ? moment(date).format('YYYY-MM-DD h:mm A') : null
      }
    }
  }
</script>
