<template>
  <v-layout row justify-space-around>
    <v-flex xs12>
      <v-card>
        <v-card-text class="primary">
          <div class="title font-weight-regular white--text">{{ getGreeting() }}</div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-text>
          <v-layout row wrap>
            <v-flex xs12 md4>
              <span class="body-2">Role: </span>
              <span>{{ getRole() }}</span>
            </v-flex>
            <v-flex xs12 md4 text-md-center>
              <span class="body-2">Email: </span>
              <span>{{ getEmail() }}</span>
            </v-flex>
            <v-flex xs12 md4 text-md-right>
              <span class="body-2">Joined: </span>
              <span>{{ getJoinedDate() }}</span>
            </v-flex>
          </v-layout>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import moment from 'moment'
import ApplicationMixin from '../../../mixins/ApplicationMixin.js'
export default {
  mixins: [ApplicationMixin],
  methods: {
    getGreeting () {
      const currentHour = new Date().getHours()
      const firstName = this.$_user ? this.$_user.first_name : null

      if (currentHour < 12) return 'Good morning, ' + firstName
      if (currentHour < 18) return 'Good afternoon, ' + firstName
      return 'Good evening, ' + firstName
    },
    getJoinedDate () {
      return this.$_user ? moment(this.$_user.created_at).fromNow() : null
    },
    getRole () {
      return this.$_user ? this.$_getApplicationUserRoleName(this.$_user.id) : null
    },
    getEmail () {
      return this.$_user ? this.$_user.email : null
    }
  }
}
</script>