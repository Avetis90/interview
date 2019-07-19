<template>
  <v-layout row wrap>
    <v-flex d-flex xs12>
      <v-layout row wrap>
        <v-flex d-flex xs12>
          <h1 class="headline primary--text py-3">Users</h1>
          <v-spacer></v-spacer>
          <div class="text-xs-right py-2" v-if="userIsAdmin">
            <v-tooltip bottom>
              <v-btn icon @click="editMode = !editMode" slot="activator">
                <v-icon>edit</v-icon>
              </v-btn>
              <span>Edit Page</span>
            </v-tooltip>
          </div>
        </v-flex>
        <v-flex d-flex xs12>
          <p>Select an existing user below or <a href="#" @click.stop="invite = true">add new users</a>.</p>
        </v-flex>

        <v-flex>
          <CustomSlot type="usersHeader" :mode="editMode" />
        </v-flex>

        <v-flex d-flex xs12>
          <DataTable
            title="Users"
            item-key="id"
            v-bind:headers="headers"
            v-bind:items="items"
            v-bind:loading="loading"
            @refresh="refreshItems"
            @delete="deleteItems"
            @click="selectItem"
            @create="createItem"
          ></DataTable>
        </v-flex>

        <v-flex>
          <CustomSlot type="usersFooter" :mode="editMode" />
        </v-flex>
      </v-layout>
    </v-flex>

    <InviteApplication :visible="invite" :slug="this.$_slug" @close="invite = false"></InviteApplication>
  </v-layout>
</template>

<script>
  import get from 'lodash/get'
  const InviteApplication = () => import('../Application/InviteApplication')
  const DataTable = () => import('../DataTable/DataTable')
  const CustomSlot = () => import('../Layout/CustomSlot')
  export default {
    name: 'UsersList',
    components: {
      InviteApplication,
      CustomSlot,
      DataTable
    },
    data () {
      return {
        editMode: false,
        loading: false,
        invite: false
      }
    },
    computed: {
      userIsAdmin () {
        return this.$store.getters.userIsSuperAdmin || this.$store.getters.userIsAdmin(this.$_slug, this.$store.getters.user.id)
      },
      users () {
        return this.$store.getters.users(this.$_slug)
      },
      headers () {
        let headers = [
          { text: 'User ID', value: 'id', visible: false },
          { text: 'First Name', value: 'first_name' },
          { text: 'Last Name', value: 'last_name' },
          { text: 'Email', value: 'email' },
          { text: 'Role', value: 'role' },
          { text: 'Created', value: 'created', visible: false },
          { text: 'Updated', value: 'updated' },
          { text: 'Status', value: 'status' }
        ]
        return headers
      },
      items () {
        let items = []
        this.users.forEach(user => {
          let item = { ...user }
          item.role = this.$_getUserApplicationRole(user)
          item.created = this.$_getDateTime(user.created_at)
          item.updated = this.$_getDateTime(user.updated_at)
          item.status = user.disabled ? 'Disabled' : get(user, 'status.label')
          items.push(item)
        })
        return items
      }
    },
    methods: {
      refreshItems () {
        this.loadData()
      },
      deleteItems (items) {
        items.forEach(item => {
          this.$store.dispatch('deleteUser', { slug: this.$_slug, id: item })
        })
        this.loadData()
      },
      selectItem (item) {
        this.$router.push('/users/' + item)
      },
      createItem () {
        this.invite = true
      },
      loadData () {
        this.loading = true
        Promise.all([
          this.$store.dispatch('loadUsers', this.$_slug)
        ])
        .catch(() => {
          this.$router.push('/dashboard?error=403')
        })
        .finally(() => {
          this.loading = false
        })
      }
    },
    created: function () {
      this.loadData()
    }
  }
</script>
