<template>
  <v-dialog v-model="showDialog" width="600">
    <v-card>
      <v-toolbar
        flat
        dark
        color="primary">
        <v-toolbar-title>Edit User</v-toolbar-title>
      </v-toolbar>

      <v-card-text>
        <v-layout row wrap>
          <v-flex xs12>
            <v-text-field
              name="email"
              label="Email"
              id="email"
              v-model="user.email"
              type="email"
              disabled>
            </v-text-field>
          </v-flex>
          <v-flex xs12>
            <v-select
              :items="applicationRoles"
              item-text="name"
              item-value="id"
              v-model="user.application_role_id"
              label="Application Role"
            ></v-select>
          </v-flex>
        </v-layout>
      </v-card-text>
      <v-divider></v-divider>
      <v-subheader>Settings</v-subheader>
      <v-card-text>
        <v-layout>
          <v-flex xs12>
            <v-switch 
              v-model="user.disabled"
              label="Disabled"
              persistent-hint
              hint="A disabled user will not be able to login and will not receive workflow emails."
            ></v-switch>
          </v-flex>
        </v-layout>
      </v-card-text>
      <v-divider></v-divider>
      <v-subheader>Workflow Snooze</v-subheader>
      <v-card-text>
        <p class="body-1">
          Occasionally you may need to delay workflow emails for a user, for example, when you know 
          they will be on leave.
        </p>
        <v-layout>
          <v-flex xs12 md6 pr-4>
            <v-text-field
              v-model="multiplier"
              label="Delay"
              type="number"
              :rules="rules.delay"
            ></v-text-field>
          </v-flex>
          <v-flex xs12 md6>
            <v-autocomplete
              :items="periods"
              item-value="milliseconds"
              item-text="label"
              label="Period"
              v-model="period"
            ></v-autocomplete>
          </v-flex>
        </v-layout>
      </v-card-text>

      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
          <v-btn
            flat
            @click.stop="cancel"
          >Cancel</v-btn>
          <v-btn
            color="primary"
            @click.stop="save"
          >Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>

<script>
  import get from 'lodash/get'
  import { mapGetters } from 'vuex'
  export default {
    name: 'UserEdit',
    props: {
      show: {
        type: Boolean,
        default: false
      },
      id: {
        type: Number
      },
      slug: {
        type: String
      }
    },
    data () {
      return {
        showDialog: false,
        period: 0,
        multiplier: 0,
        rules: {
          delay: [
            v => !!v || 'Delay is required'
          ]
        }
      }
    },
    computed: {
      ...mapGetters([
        'applicationRoles',
        'userById',
        'periods'
      ]),
      user () {
        return this.userById(this.slug, this.id) || {}
      }
    },
    methods: {
      save () {
        this.$store.dispatch('updateUser', {
          slug: this.slug,
          id: this.user.id,
          disabled: this.user.disabled,
          application_role_id: this.user.application_role_id,
          multiplier: this.multiplier || 0,
          period: this.period
        })
        this.close()
      },
      close () {
        this.$emit('close')
      },
      cancel () {
        this.close()
      }
    },
    watch: {
      show: {
        immediate: true,
        handler () {
          this.period = get(this.user, 'meta.period', 60000)
          this.multiplier = get(this.user, 'meta.multiplier', 0)
          this.showDialog = this.show
        }
      }
    }
  }
</script>
