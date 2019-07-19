<template>
  <v-dialog width="600px" v-model="editPassword" full-width>
    <v-btn large block slot="activator">Change Password</v-btn>
    <v-card>
      <v-container>
        <v-layout row v-if="error">
          <v-flex xs12 sm12>
            <app-alert @dismissed="onDismissed" :text="error.message"></app-alert>
          </v-flex>
        </v-layout>
        <v-layout row wrap>
          <v-flex xs12>
            <v-card-title>
              <h2>Change Password</h2>
            </v-card-title>
          </v-flex>
        </v-layout>
        <v-layout row wrap>
          <v-flex xs12>
            <v-card-text>
              <v-text-field
                name="oldPassword"
                label="Old Password"
                id="oldPassword"
                v-model="oldPassword"
                type="password"
                required>
              </v-text-field>
            </v-card-text>
          </v-flex>
        </v-layout>
        <v-layout row wrap>
          <v-flex xs12>
            <v-card-text>
              <v-text-field
                name="newPassword"
                label="New Password"
                id="newPassword"
                v-model="password"
                type="password"
                :rules="[validation]">
              </v-text-field>
            </v-card-text>
          </v-flex>
        </v-layout>
        <PasswordComplexity />

        <v-divider></v-divider>
        <v-layout row py-2>
          <v-flex xs12 class="text-xs-right">
            <v-btn
              flat
              @click="editPassword = false"
            >
              Close
            </v-btn>
            <v-btn
              class="primary"
              @click="onSavePassword"
              :disabled="loading"
              :loading="loading"
            >
              Save
            </v-btn>
          </v-flex>
        </v-layout>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script>
  import PasswordMixin from '../PasswordMixin.js'
  const PasswordComplexity = () => import('./../PasswordComplexity')
  export default {
    mixins: [PasswordMixin],
    components: {
      PasswordComplexity
    },
    data () {
      return {
        oldPassword: '',
        password: '',
        editPassword: false
      }
    },
    methods: {
      onSavePassword () {
        if (this.password === '') {
          return
        }
        this.$store.dispatch('updatePassword', { oldPassword: this.oldPassword, newPassword: this.password })
      },
      onDismissed () {
        this.$store.dispatch('clearError')
      }
    },
    watch: {
      loading (value) {
        if (!value && !this.error && this.editPassword) {
          this.editPassword = false
        }
      },
      editPassword (value) {
        if (!value) {
          this.password = ''
          this.oldPassword = ''
        } else {
          this.$store.dispatch('clearError')
        }
      }
    },
    computed: {
      error () {
        return this.$store.getters.error
      },
      loading () {
        return this.$store.getters.loading
      }
    }
  }
</script>