<template>
  <v-dialog v-model="showDialog" fullscreen hide-overlay lazy>
    <v-card>
      <v-toolbar dark color="primary">
        <v-btn icon dark @click.stop="close()">
          <v-icon>close</v-icon>
        </v-btn>
        <v-toolbar-title>{{ title }}</v-toolbar-title>
      </v-toolbar>

      <v-form
        ref="form"
        v-model="valid"
        lazy-validation
      >
        <v-container fluid>
          <div class="title my-2">Note Details</div>
          <p>Set the details of the note.</p>
          <v-layout row wrap class="mb-4">

            <v-flex xs12>
              <v-layout>
                <v-flex xs12 md6 pr-4>
                  <v-autocomplete
                    :items="recordableTypesList"
                    v-model="note.recordable_type"
                    label="Record type"
                    :rules="rules.record_type"
                  ></v-autocomplete>
                </v-flex>

                <v-flex xs12 md6>
                  <v-autocomplete
                    v-model="note.recordable_id"
                    :items="getRecordables(note.recordable_type)"
                    label="Record"
                    item-text="name"
                    item-value="id"
                    :rules="rules.record"
                  ></v-autocomplete>
                </v-flex>
              </v-layout>
            </v-flex>

            <v-flex xs12>
              <v-layout>
                <v-flex xs12 md6 pr-4>
                  <v-autocomplete
                    :items="noteTypes"
                    item-value="id"
                    item-text="type"
                    v-model="note.note_type_id"
                    label="Note type"
                    :rules="rules.note_type"
                  ></v-autocomplete>
                </v-flex>

                <v-flex xs12 md6>
                  <v-text-field
                    v-model="note.description"
                    label="Description"
                    :rules="rules.description"
                  ></v-text-field>
                </v-flex>
              </v-layout>
            </v-flex>

            <v-flex xs12>
              <v-textarea
                v-model="note.note"
                label="Note"
                rows=2
                auto-grow
              ></v-textarea>
            </v-flex>

          </v-layout>
        </v-container>

        <v-divider class="py-2"></v-divider>

        <v-container fluid>
          <div class="title my-2">Followup Task</div>
          <p>Set the details of any followup tasks for the note.</p>

          <v-layout row wrap class="mb-4">
            <v-flex xs12>
              <v-textarea
                v-model="note.task"
                label="Task"
                rows=2
                auto-grow
              ></v-textarea>
            </v-flex>

            <v-flex xs12>
              <v-dialog
                ref="dateDialog"
                v-model="dateDialog"
                :return-value.sync="note.task_due_at"
                lazy
                full-width
                width="290px"
              >
                <template v-slot:activator="{ on }">
                  <v-text-field
                    v-model="note.task_due_at"
                    label="Task Due"
                    prepend-icon="event"
                    readonly
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker v-model="note.task_due_at" scrollable>
                  <v-spacer></v-spacer>
                  <v-btn flat color="primary" @click="dateDialog = false">Cancel</v-btn>
                  <v-btn flat color="primary" @click="$refs.dateDialog.save(note.task_due_at)">OK</v-btn>
                </v-date-picker>
              </v-dialog>
            </v-flex>

            <v-flex xs12>
              <v-checkbox
                v-model="note.completed"
                label="Task Completed"
              ></v-checkbox>
            </v-flex>

          </v-layout>

        </v-container>

        <v-divider></v-divider>
        <v-container fluid>
          <v-layout row py-2>
            <v-flex xs12 class="text-xs-right">
              <v-btn flat @click.stop="close">Cancel</v-btn>
              <v-btn flat class="primary" @click.stop="validate">Save</v-btn>
            </v-flex>
          </v-layout>
        </v-container>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
import sortBy from 'lodash/sortBy'
import { mapGetters } from 'vuex'
export default {
  name: 'NotesEdit',
  props: {
    id: {
      type: Number
    },
    show: {
      type: Boolean,
      default: false
    },
    recordType: {
      type: String
    },
    record: {
      type: Number
    }
  },
  data () {
    return {
      valid: true,
      showDialog: this.show,
      dateDialog: false,
      title: 'Edit Note',
      recordableTypes: [
        'User',
        'Organisation'
      ],
      note: {
        note_type_id: '',
        description: '',
        note: '',
        recordable_type: '',
        recordable_id: '',
        task: null,
        task_due_at: null,
        completed: false
      },
      noteTemplate: {
        note_type_id: '',
        description: '',
        note: '',
        recordable_type: '',
        recordable_id: '',
        task: null,
        task_due_at: null,
        completed: false
      },
      rules: {
        record_type: [
          v => !!v || 'Record type is required'
        ],
        record: [
          v => !!v || 'Record is required'
        ],
        note_type: [
          v => !!v || 'Note type is required'
        ],
        description: [
          v => !!v || 'Description is required'
        ]
      }
    }
  },
  computed: {
    ...mapGetters([
      'users',
      'organisations',
      'noteTypes'
    ]),
    userList () {
      const users = this.record && this.recordType === 'User' ? this.users(this.$_slug).filter(u => u.id === this.record) : this.users(this.$_slug)
      return users.map(u => {
        u.name = u.first_name + ' ' + u.last_name + ' (' + u.email + ')'
        return u
      })
    },
    organisationList () {
      return this.record && this.recordType === 'Organisation' ? this.organisations(this.$_slug).filter(o => o.id === this.record) : this.organisations(this.$_slug)
    },
    recordableTypesList () {
      return this.recordType ? this.recordableTypes.filter(rt => rt === this.recordType) : this.recordableTypes
    }
  },
  methods: {
    saveNote () {
      this.note.slug = this.$_slug
      this.$store.dispatch(this.note.id ? 'updateNote' : 'createNote', this.note)
      .then(() => {
        this.loadData()
        this.close()
      })
      .catch(error => {
        console.log(error)
      })
    },
    close () {
      this.$emit('close')
      this.note = { ...this.noteTemplate }
    },
    validate () {
      if (this.$refs.form.validate()) {
        this.saveNote()
      }
    },
    getRecordables (type) {
      const records = type === 'Organisation' ? this.organisationList : this.userList
      return sortBy(records, record => record.name)
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
  watch: {
    show: {
      immediate: true,
      handler () {
        this.showDialog = this.show
      }
    },
    id: {
      immediate: true,
      handler () {
        this.note = { ...this.$store.getters.noteById(this.$_slug, this.id) }
      }
    }
  }
}
</script>
