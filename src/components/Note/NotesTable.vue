<template>
  <div>
    <DataTable
      title="Notes"
      item-key="id"
      :headers="headers"
      :items="items"
      :loading="loading"
      @refresh="refreshItems"
      @delete="deleteItems"
      @click="selectItem"
      @create="createItem"
    ></DataTable>
    <NotesEdit :id="noteId" :show="showEdit" :recordType="recordType" :record="record" @close="closeEdit()"></NotesEdit>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
const DataTable = () => import('../DataTable/DataTable')
const NotesEdit = () => import('./NotesEdit')
export default {
  name: 'NotesTable',
  props: {
    // Array of objects to filter results [{ key: '', values: [] }]
    filters: {
      type: Array,
      default: () => []
    },
    recordType: {
      type: String
    },
    record: {
      type: Number
    }
  },
  components: {
    DataTable,
    NotesEdit
  },
  data () {
    return {
      showEdit: false,
      loading: false,
      noteId: null,
      itemFilters: this.filters
    }
  },
  computed: {
    ...mapGetters([
      'notes',
      'noteTypeById',
      'userById',
      'organisationById'
    ]),
    headers () {
      const headers = [
        { text: 'Note ID', value: 'id', visible: false },
        { text: 'Type', value: 'type' },
        { text: 'Description', value: 'description' },
        { text: 'Record Type', value: 'recordable_type' },
        { text: 'Record ID', value: 'recordable_id', visible: false },
        { text: 'Record', value: 'record' },
        { text: 'Owner', value: 'owner' },
        { text: 'Task', value: 'task' },
        { text: 'Completed', value: 'completed' },
        { text: 'Due', value: 'task_due_at' },
        { text: 'Updated', value: 'updated_at' }
      ]
      return headers
    },
    filteredItems () {
      let items = []
      this.itemFilters.forEach(filter => {
        const filteredItems = this.notes(this.$_slug).filter(note => {
          return note.recordable_type === filter.key && filter.values.includes(note.recordable_id)
        })
        items = [ ...items, ...filteredItems ]
      })
      return this.filters.length ? items : this.notes(this.$_slug)
    },
    items () {
      let items = []
      this.filteredItems.forEach(note => {
        let item = { ...note }
        item.type = this.noteTypeById(item.note_type_id).type
        item.owner = item.user ? item.user.first_name + ' ' + item.user.last_name : ''
        item.record = item.recordable_type === 'User' ? this.getUserFullName(item.recordable_id) : this.getOrganisationName(item.recordable_id)
        item.completed = item.completed ? 'Yes' : 'No'
        item.task_due_at = item.task_due_at ? this.$_getDateTime(item.task_due_at) : ''
        item.updated_at = this.$_getDateTime(item.updated_at)
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
        this.$store.dispatch('deleteNote', { id: item, slug: this.$_slug })
      })
      this.loadData()
    },
    selectItem (item) {
      this.noteId = item
      this.showEdit = true
    },
    createItem () {
      this.noteId = null
      this.showEdit = true
    },
    getUserFullName (userId) {
      const user = this.userById(this.$_slug, userId)
      return user ? user.first_name + ' ' + user.last_name : ''
    },
    getOrganisationName (organisationId) {
      const organisation = this.organisationById(this.$_slug, organisationId)
      return organisation ? organisation.name : ''
    },
    closeEdit () {
      this.showEdit = false
      this.noteId = null
    },
    loadData () {
      this.loading = true
      Promise.all([
        this.$store.dispatch('loadUsers', this.$_slug),
        this.$store.dispatch('loadOrganisations', this.$_slug),
        this.$store.dispatch('getNotes', this.$_slug)
      ])
      .then(() => {
        this.loading = false
      })
    }
  },
  created () {
    this.loadData()
  },
  watch: {
    filters: {
      immediate: true,
      handler () {
        this.itemFilters = this.filters
      }
    }
  }
}
</script>
