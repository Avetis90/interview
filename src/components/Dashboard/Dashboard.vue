<template>
  <v-layout row wrap>
    <v-flex d-flex xs12>
      <v-layout row wrap>

        <!-- //Title -->
        <v-flex d-flex xs12>
          <h1 class="headline primary--text py-3">Dashboard</h1>
          <v-spacer></v-spacer>
          <div class="text-xs-right py-2" v-if="this.$_isApplicationAdminUser()">
            <v-tooltip bottom>
              <v-btn icon @click="editMode = !editMode" slot="activator">
                <v-icon>edit</v-icon>
              </v-btn>
              <span>Edit Page</span>
            </v-tooltip>
          </div>
        </v-flex>
      </v-layout>
    </v-flex>

    <v-flex>
      <CustomSlot type="dashboardHeader" :mode="editMode" />
    </v-flex>

    <!-- // Custom Dashboards -->
    <VlineDashboard v-if="getDashboard() === 'vline'"></VlineDashboard>
    <DefaultDashboard v-else></DefaultDashboard>

    <v-flex>
      <CustomSlot type="dashboardFooter" :mode="editMode" />
    </v-flex>

    <!-- //Show snackbar -->
    <Snackbar color="warning" :content="snackbar" :snackbar="snackbar" @dismissed="snackbar = false"></Snackbar>
  </v-layout>
</template>

<script>
import ApplicationMixin from '../../mixins/ApplicationMixin.js'
const DefaultDashboard = () => import('./DefaultDashboard')
const VlineDashboard = () => import('./VlineDashboard')
const CustomSlot = () => import('../Layout/CustomSlot')
export default {
  name: 'Dashboard',
  mixins: [ApplicationMixin],
  components: {
    DefaultDashboard,
    VlineDashboard,
    CustomSlot
  },
  data () {
    return {
      editMode: false,
      snackbar: null
    }
  },
  created () {
    // TODO: Error handling to be matured across frontend as discussed in '4wmEwudz'
    if (document.location.search.indexOf('?error=403') !== -1) {
      this.snackbar = 'You are not permitted to perform that action'
      this.$router.replace({ error: null })
    }
  },
  methods: {
    getDashboard () {
      switch (this.$_slug) {
        case 'vline': return 'vline'
        // case 'contoso': return 'vline'
        default: return null
      }
    }
  }
}
</script>
