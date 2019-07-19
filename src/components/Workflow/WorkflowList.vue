<template>
  <v-layout row wrap>

    <v-flex d-flex xs12>
      <h1 class='headline primary--text py-3'>Workflows</h1>
    </v-flex>

    <v-flex d-flex xs12>
      <p>Select an existing workflow item below or <a href='#' @click.stop='dialog = true'>create a new workflow item</a>.</p>
    </v-flex>

    <!-- // Data Table -->
    <v-flex d-flex xs12>
      <v-card>
        <v-card-title>
          <v-spacer></v-spacer>
          <v-text-field
            v-model="search"
            append-icon="search"
            label="Search"
            single-line
            hide-details
          ></v-text-field>
        </v-card-title>
        <v-data-table
          :headers="headers"
          :items="workflows"
          :search="search"
          :loading="loadingWorkflows"
          :pagination.sync="pagination"
          :rows-per-page-items="[25, 50, 100, { text: '$vuetify.dataIterator.rowsPerPageAll', value: -1 }]"
        >
          <template v-slot:items="props">
            <td @click='editItem(props.item)'>{{ props.item.name }}</td>
            <td @click='editItem(props.item)'>{{ props.item.action_label }}</td>
            <td @click='editItem(props.item)'>{{ props.item.delay_label }}</td>
            <td @click='editItem(props.item)'>{{ props.item.trigger_label }}</td>
            <td @click='editItem(props.item)'>{{ props.item.active_from | $_formatDateTime }}</td>
            <td @click='editItem(props.item)'>{{ props.item.active_to | $_formatDateTime }}</td>
            <td @click='editItem(props.item)'>{{ props.item.created_at | $_formatDateTime }}</td>
            <td @click='editItem(props.item)'>{{ props.item.updated_at | $_formatDateTime }}</td>
            <td class="justify-center layout px-0">
              <v-tooltip bottom>
                <v-btn icon class='mx-0' @click='deleteItem(props.item)' slot="activator">
                  <v-icon color='pink'>delete</v-icon>
                </v-btn>
                <span>Delete</span>
              </v-tooltip>
            </td>
          </template>
          <v-alert v-slot:no-results :value="true" color="error" icon="warning">
            Your search for "{{ search }}" found no results.
          </v-alert>
        </v-data-table>
      </v-card>
    </v-flex>

    <!-- // Edit Dialog -->
    <v-dialog v-model="dialog" fullscreen hide-overlay lazy>
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click.stop="close()">
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title>{{ dialogTitle }}</v-toolbar-title>
        </v-toolbar>

        <v-form
          ref="form"
          v-model="valid"
          lazy-validation
        >

          <!-- // Workflow Details -->
          <v-container fluid>

            <div class="title my-2">Workflow Details</div>
            <p>Set the details of the workflow.</p>
            <v-layout row wrap class="mb-4">

              <v-flex xs12>
                <v-layout>
                  <v-flex xs12>
                    <v-text-field
                      v-model="workflow.name"
                      label="Name"
                      :rules="rules.name"
                    ></v-text-field>
                  </v-flex>
                </v-layout>
              </v-flex>

              <v-flex xs12>
                <v-layout>
                  <v-flex xs12 md4 pr-4>
                    <v-autocomplete
                      :items="actions"
                      item-value="id"
                      item-text="label"
                      v-model="workflow.config.action_id"
                      label="Action"
                      :rules="rules.action"
                    ></v-autocomplete>
                  </v-flex>

                  <v-flex xs12 md4 pr-4>
                    <v-layout>
                      <v-flex xs12 md6 pr-4>
                        <v-text-field
                          v-model="workflow.config.multiplier"
                          label="Delay"
                          :rules="rules.multiplier"
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 md6>
                        <v-autocomplete
                          :items="periods"
                          item-value="id"
                          item-text="label"
                          label="Period"
                          v-model="workflow.config.period_id"
                          :rules="rules.milliseconds"
                        ></v-autocomplete>
                      </v-flex>
                    </v-layout>
                  </v-flex>

                  <v-flex xs12 md4>
                    <v-autocomplete
                      :items="triggers"
                      item-value="id"
                      item-text="label"
                      v-model="workflow.config.trigger_id"
                      label="Event"
                      :rules="rules.trigger"
                    ></v-autocomplete>
                  </v-flex>
                </v-layout>
              </v-flex>

            </v-layout>

          </v-container>

          <v-divider class="py-2"></v-divider>

          <!-- // Active Period -->
          <v-container fluid>

            <div class="title my-2">Active Period</div>
            <p>Set the period in which the workflow should run.</p>

            <v-layout>
              <v-flex xs12 xs6 pr-4>
                <v-dialog
                  ref="activeFromDialog"
                  v-model="activeFromDialog"
                  :return-value.sync="workflow.active_from"
                  lazy
                  full-width
                  width="290px"
                >
                  <template v-slot:activator="{ on }">
                    <v-text-field
                      v-model="workflow.active_from"
                      label="Start"
                      prepend-icon="event"
                      readonly
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker v-model="workflow.active_from" scrollable>
                    <v-spacer></v-spacer>
                    <v-btn flat color="primary" @click="activeFromDialog = false">Cancel</v-btn>
                    <v-btn flat color="primary" @click="$refs.activeFromDialog.save(workflow.active_from)">OK</v-btn>
                  </v-date-picker>
                </v-dialog>
              </v-flex>

              <v-flex xs12 xs6 pr-4>
                <v-dialog
                  ref="activeToDialog"
                  v-model="activeToDialog"
                  :return-value.sync="workflow.active_to"
                  lazy
                  full-width
                  width="290px"
                >
                  <template v-slot:activator="{ on }">
                    <v-text-field
                      v-model="workflow.active_to"
                      label="Finish"
                      prepend-icon="event"
                      readonly
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker v-model="workflow.active_to" scrollable>
                    <v-spacer></v-spacer>
                    <v-btn flat color="primary" @click="activeToDialog = false">Cancel</v-btn>
                    <v-btn flat color="primary" @click="$refs.activeToDialog.save(workflow.active_to)">OK</v-btn>
                  </v-date-picker>
                </v-dialog>
              </v-flex>

            </v-layout>

          </v-container>

          <!-- // Emal Action -->
          <template v-if="isEmailAction()">
            <v-divider class="py-2"></v-divider>

            <v-container fluid>

              <div class="title my-2">Email Settings</div>
              <p>Configure the email to be sent.</p>
              <v-layout row wrap class="mb-4">
                <v-flex xs12>
                  <v-text-field
                    label="Subject"
                    v-model="workflow.action_config.subject"
                    :rules="rules.action_config.email.subject"
                  ></v-text-field>
                </v-flex>

                <v-flex xs12>
                  <v-text-field
                    label="CC"
                    v-model="workflow.action_config.cc"
                  ></v-text-field>
                </v-flex>

                <v-flex xs12>
                  <v-text-field
                    label="BCC"
                    v-model="workflow.action_config.bcc"
                  ></v-text-field>
                </v-flex>

                <v-flex xs12>
                  <quill-editor 
                    v-model="workflow.action_config.message"
                    :rules="rules.action_config.email.message"
                  >
                  </quill-editor>
                </v-flex>
              </v-layout>

            </v-container>
          </template>
      
          <!-- // Actions -->
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

    <v-tooltip top>
      <v-btn slot='activator' fixed dark bottom right fab router class='red' @click.stop='dialog = true'>
        <v-icon>add</v-icon>
      </v-btn>
      <span>Create Workflow</span>
    </v-tooltip>

  </v-layout>
</template>

<script>
import find from 'lodash/find'
import ApplicationMixin from '../../mixins/ApplicationMixin'
export default {
  mixins: [ApplicationMixin],
  data () {
    return {
      valid: true,
      workflowId: -1,
      dialog: false,
      loadingWorkflows: false,
      search: '',
      activeFromDialog: false,
      activeToDialog: false,
      actionType: null,
      pagination: {
        sortBy: 'updated_at',
        descending: true
      },
      headers: [
        { text: 'Name', value: 'name' },
        { text: 'Action', value: 'action_label' },
        { text: 'Delay', value: 'delay_label' },
        { text: 'Trigger', value: 'trigger_label' },
        { text: 'Start', value: 'active_from' },
        { text: 'Finish', value: 'active_to' },
        { text: 'Created', value: 'created_at' },
        { text: 'Updated', value: 'updated_at' },
        { text: 'Actions', value: 'name', sortable: false }
      ],
      workflow: {},
      workflowTemplate: {
        name: '',
        trigger: '',
        trigger_config: {},
        action: '',
        action_config: {},
        delay: 0,
        active_from: null,
        active_to: null,
        config: {
          multiplier: 0,
          period_id: null,
          action_id: null,
          trigger_id: null
        }
      },
      rules: {
        name: [
          v => !!v || 'Name is required'
        ],
        action: [
          v => !!v || 'Action is required'
        ],
        delay: [
          v => !!v || 'Delay is required'
        ],
        period: [
          v => !!v || 'Period is required'
        ],
        trigger: [
          v => !!v || 'Event is required'
        ],
        active_from: [
          v => !!v || 'Start date is required'
        ],
        action_config: {
          email: {
            subject: [
              v => !!v || 'Subject is required'
            ],
            message: [
              v => !!v || 'Message is required'
            ]
          }
        }
      },
      triggers: [
        { id: 1, trigger: 'Invite', label: 'after user invited', config: {} },
        { id: 2, trigger: 'Invite', label: 'after user invited, not accepted', config: { 'invitation_status': false } }
      ],
      actions: [
        { id: 1, action: 'SendEmail', label: 'Send email' }
      ],
      periods: [
        { id: 1, milliseconds: 60000, label: 'minutes' },
        { id: 2, milliseconds: 3600000, label: 'hours' },
        { id: 3, milliseconds: 86400000, label: 'days' },
        { id: 4, milliseconds: 604800000, label: 'weeks' }
      ]
    }
  },
  computed: {
    workflows () {
      let workflows = this.$store.getters.workflows(this.$_slug)
      workflows.forEach(workflow => {
        workflow.config = this.getJSONObject(workflow.config)
        workflow.action_config = this.getJSONObject(workflow.action_config)
        workflow.trigger_config = this.getJSONObject(workflow.trigger_config)
        const actionItem = this.findAction(workflow.config.action_id) || {}
        const triggerItem = this.findTrigger(workflow.config.trigger_id) || {}
        const periodItem = this.findPeriod(workflow.config.period_id) || {}
        workflow.delay_label = (workflow.config.multiplier || '') + ' ' + (periodItem.label || '')
        workflow.trigger_label = triggerItem.label || ''
        workflow.action_label = actionItem.label || ''
      })
      return workflows
    },
    dialogTitle () {
      return this.workflowId === -1 ? 'Create Workflow' : 'Edit Workflow'
    },
    trigger () {
      return this.findTrigger(this.workflow.config.trigger_id) || {}
    },
    action () {
      return this.findAction(this.workflow.config.action_id) || {}
    },
    period () {
      return this.findPeriod(this.workflow.config.period_id) || {}
    },
    createMode () {
      return this.workflowId === -1
    }
  },
  methods: {
    getJSONObject (string) {
      let object = {}
      try {
        object = JSON.parse(string)
      } catch (error) {}
      return object
    },
    findTrigger (id) {
      return find(this.triggers, trigger => { return trigger.id === id })
    },
    findAction (id) {
      return find(this.actions, action => { return action.id === id })
    },
    findPeriod (id) {
      return find(this.periods, period => { return period.id === id })
    },
    close () {
      this.dialog = false
      setTimeout(() => {
        this.workflow = Object.assign({}, this.workflowTemplate)
        this.workflowId = -1
      }, 300)
    },
    validate () {
      if (this.$refs.form.validate()) {
        this.save()
      }
    },
    save () {
      let workflow = Object.assign({}, this.workflow)
      workflow.slug = this.$_slug
      workflow.trigger = this.trigger ? this.trigger.trigger : ''
      workflow.trigger_config = JSON.stringify(this.trigger ? this.trigger.config : {})
      workflow.action = this.action ? this.action.action : ''
      workflow.action_config = JSON.stringify(workflow.action_config)
      workflow.delay = workflow.config.multiplier * this.period.milliseconds
      workflow.config = JSON.stringify(workflow.config)
      const dispatchMethod = this.workflowId === -1 ? 'createWorkflow' : 'updateWorkflow'
      Promise.all([
        this.$store.dispatch(dispatchMethod, workflow)
      ])
      .then(() => {
        this.loadWorkflows()
        this.close()
      })
    },
    loadWorkflows () {
      this.loadingWorkflows = true
      Promise.all([
        this.$store.dispatch('loadWorkflows', this.$_slug)
      ])
      .then(() => {
        this.loadingWorkflows = false
      })
    },
    isEmailAction () {
      return this.action && this.action.action === 'SendEmail'
    },
    editItem (item) {
      this.workflowId = item.id
      const workflow = find(this.workflows, workflow => { return workflow.id === item.id })
      this.workflow = Object.assign({}, workflow)
      this.dialog = true
    },
    deleteItem (item) {
      const payload = {
        slug: this.$_slug,
        id: item.id
      }
      this.loadingWorkflows = true
      Promise.all([
        this.$store.dispatch('deleteWorkflow', payload)
      ])
      .then(() => {
        this.loadingWorkflows = false
      })
    }
  },
  created () {
    this.workflow = Object.assign({}, this.workflowTemplate)
    this.loadWorkflows()
  }
}
</script>