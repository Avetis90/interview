<template>
  <v-layout row wrap>
    <v-flex d-flex xs12>
      <v-layout row wrap>
        <v-flex xs12 sm6 md4 d-flex>
          <v-card>
            <v-card-text>
              <v-container>
                <v-layout row pb-4>
                  <v-flex text-xs-center>
                    <v-avatar
                      size="80px"
                      class="primary">
                      <v-icon
                        :color="'white'"
                        large>
                        account_circle
                      </v-icon>
                    </v-avatar>
                  </v-flex>
                </v-layout>
                <v-layout row>
                  <v-flex text-xs-center class="overflow-flex">
                    <template v-if="userIsAuthenticated">
                      <EditEmail></EditEmail>
                    </template>
                  </v-flex>
                </v-layout>
                <v-layout row>
                  <v-flex text-xs-center class="overflow-flex">
                    <template v-if="userIsAuthenticated">
                      <EditPassword></EditPassword>
                    </template>
                  </v-flex>
                </v-layout>
                <v-layout row>
                  <v-flex text-xs-center class="overflow-flex">
                    <v-btn block large
                      color="error"
                      @click="onDestroyUser"
                    >
                      Deactivate Account
                    </v-btn>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
          </v-card>
        </v-flex>
        <v-flex xs12 sm6 md8 d-flex>
          <v-card>
            <v-card-text>
              <v-container>
                <h1 class="mb-4">Edit account</h1>
                <form @submit.prevent="onUpdateUser">
                  <v-layout row>
                    <v-flex class="overflow-flex">
                      <v-text-field
                        name="firstname"
                        label="Firstname"
                        id="firstname"
                        v-model="firstname"
                        type="text"
                        required></v-text-field>
                    </v-flex>
                  </v-layout>
                  <v-layout row>
                    <v-flex class="overflow-flex">
                      <v-text-field
                        name="lastname"
                        label="Lastname"
                        id="lastname"
                        v-model="lastname"
                        type="text"
                        required></v-text-field>
                    </v-flex>
                  </v-layout>
                  <v-layout row>
                    <v-flex class="overflow-flex">
                      <v-text-field
                        name="email"
                        label="Email"
                        id="email"
                        v-model="email"
                        type="email"
                        disabled></v-text-field>
                    </v-flex>
                  </v-layout>
                  <v-layout row>
                    <v-flex text-xs-right>
                      <v-btn type="submit" :disabled="loading" :loading="loading" class="primary">
                        Save
                      </v-btn>
                    </v-flex>
                  </v-layout>
                </form>
              </v-container>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-flex>
  </v-layout>
</template>

<script>
  const EditEmail = () => import('./EditProfile/EditEmail')
  const EditPassword = () => import('./EditProfile/EditPassword')
  export default {
    data () {
      return {
        firstname: '',
        lastname: '',
        email: '',
        editProfile: false
      }
    },
    components: {
      EditEmail,
      EditPassword
    },
    computed: {
      user () {
        return this.$store.getters.user
      },
      loading () {
        return this.$store.getters.loading
      },
      userIsAuthenticated () {
        return this.user !== null && this.user !== undefined
      },
      isSocialUser () {
        return this.user.social_id
      }
    },
    methods: {
      onUpdateUser () {
        if (this.firstname.trim() === '' || this.lastname.trim() === '') {
          return
        }
        this.editProfile = true
        this.$store.dispatch('updateAuth', {first_name: this.firstname, last_name: this.lastname})
      },
      onDestroyUser () {
        this.$store.dispatch('destroyUser')
        this.$router.push('/signin')
      }
    },
    watch: {
      user (value) {
        this.firstname = value.first_name
        this.lastname = value.last_name
        this.email = value.email
      }
    },
    created: function () {
      const user = this.user
      if (user !== null && user !== undefined) {
        this.firstname = user.first_name
        this.lastname = user.last_name
        this.email = user.email
      }
    }
  }
</script>

<style scoped>
  .overflow-flex {
    min-width: 0;
  }
</style>