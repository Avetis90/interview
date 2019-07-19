<template>
  <v-dialog width="600px" v-model="editForm">
    <v-btn
      icon
      slot="activator"
      class="mx-0"
      v-if="btnRect"
    >
      <v-icon color="teal">
        edit
      </v-icon>
    </v-btn>
    <div
      slot="activator"
      v-else>
      Edit Form
    </div>
    <v-card>
      <v-card-title>
        <div class="title mb-2 mt-2">Edit Form</div>
      </v-card-title>

      <v-card-text>
        <v-layout row wrap>

          <!-- //Users -->
          <v-flex xs12>
            <v-autocomplete
              :items="users"
              item-value="user_id"
              item-text="display_name"
              v-model="userId"
              label="Owner"
            ></v-autocomplete>
          </v-flex>

          <!-- //Organisations -->
          <v-flex xs12>
            <v-autocomplete
              :items="organisations"
              item-value="id"
              item-text="name"
              v-model="organisationId"
              label="Organisation"
            ></v-autocomplete>
          </v-flex>
          
          <!-- //Period Start -->
          <div class="body-2">Is this form for a set period? If so, set the date below (optional)</div>
          <v-flex xs12 sm6>

            <v-dialog
              ref="periodStartDialog"
              v-model="periodStartModal"
              :return-value.sync="periodStart"
              lazy
              full-width
              width="290px"
            >
              <v-text-field
                slot="activator"
                v-model="periodStart"
                prepend-icon="event"
                label="Period Start"
                readonly
              ></v-text-field>
              <v-date-picker v-model="periodStart" scrollable>
                <v-spacer></v-spacer>
                <v-btn flat color="primary" @click="periodStartModal = false">Cancel</v-btn>
                <v-btn flat color="primary" @click="$refs.periodStartDialog.save(periodStart)">OK</v-btn>
              </v-date-picker>
            </v-dialog>

          </v-flex>

          <!-- //Period End -->
          <v-flex xs12 sm6>

            <v-dialog
              ref="periodEndDialog"
              v-model="periodEndModal"
              :return-value.sync="periodEnd"
              lazy
              full-width
              width="290px"
            >
              <v-text-field
                slot="activator"
                v-model="periodEnd"
                prepend-icon="event"
                label="Period End"
                readonly
              ></v-text-field>
              <v-date-picker v-model="periodEnd" scrollable>
                <v-spacer></v-spacer>
                <v-btn flat color="primary" @click="periodEndModal = false">Cancel</v-btn>
                <v-btn flat color="primary" @click="$refs.periodEndDialog.save(periodEnd)">OK</v-btn>
              </v-date-picker>
            </v-dialog>

          </v-flex>
        </v-layout>
      </v-card-text>
      
      <v-divider></v-divider>
      <v-card-actions>
        <v-layout row py-2>
          <v-flex xs12 class="text-xs-right">
            <v-btn flat @click.stop="onCancel">Cancel</v-btn>
            <v-btn
              flat
              class="primary"
              @click="onSave"
              :disabled="loading"
              :loading="loading"
            >
              Save
            </v-btn>
          </v-flex>
        </v-layout>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  import sortBy from 'lodash/sortBy'
  export default {
    props: ['slug', 'form', 'formTemplateId', 'btnRect'],
    data () {
      return {
        id: this.form.id,
        editForm: false,
        periodStartModal: false,
        periodStart: this.form.period_start ? this.form.period_start.substring(0, 10) : null,
        periodEndModal: false,
        periodEnd: this.form.period_end ? this.form.period_end.substring(0, 10) : null,
        organisationId: this.form.organisation ? this.form.organisation.id : null,
        userId: this.form.user ? this.form.user.id : null
      }
    },
    methods: {
      onSave () {
        this.editForm = false

        let formData = {
          id: this.id,
          formTemplateId: this.formTemplateId,
          organisationId: this.organisationId,
          userId: this.userId,
          periodStart: this.periodStart,
          periodEnd: this.periodEnd
        }

        this.$store.dispatch('updateForm', formData)
      },
      onCancel () {
        this.editForm = false
        this.periodStart = this.form.period_start ? this.form.period_start.substring(0, 10) : null
        this.periodEnd = this.form.period_end ? this.form.period_end.substring(0, 10) : null
        this.organisationId = this.form.organisation ? this.form.organisation.id : null
        this.userId = this.form.user ? this.form.user.id : null
      }
    },
    computed: {
      loading () {
        return this.$store.getters.loading
      },
      organisations () {
        return sortBy(this.$store.getters.loadedOrganisations(this.slug), 'name')
      },
      users () {
        const users = this.organisationId ? this.$store.getters.loadedFormOrganisationUsers(this.organisationId) : this.$store.getters.loadedFormUsers(this.slug)
        return sortBy(users, ['first_name', 'last_name']).map(u => {
          u.display_name = u.first_name + ' ' + u.last_name + ' (' + u.email + ')'
          return u
        })
      }
    }
  }
</script>
