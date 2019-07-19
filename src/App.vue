<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      fixed
      app
      temporary
      v-if="requiresAuth && user"
    >

      <v-toolbar flat class="transparent">
        <v-list class="pa-0">
          <v-list-tile avatar>
            <v-list-tile-avatar tile>
              <img src="/static/icon.png" >
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title>{{ $_appName }}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-toolbar>

      <template v-if="application">
        <v-divider></v-divider>
        <v-list dense>
          <template
            v-for="item in applicationMenuItems"
            >
            <v-list-tile
              :to="'/' + item.path"
              :key="item.title"
              v-if="!item.admin || isAdmin"
            >
              <v-list-tile-action>
                <v-icon size="30">{{ item.icon }}</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>
                  {{ item.title }}
                </v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </template>
        </v-list>

        <v-list dense>
          <v-divider></v-divider>
          <template v-for="item in userMenuItems">
            <v-list-tile
              :to="'/' + item.path"
              :key="item.title"
              v-if="item.application || !item.application && !application"
            >
              <v-list-tile-action>
                <v-icon size="30">{{ item.icon }}</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>
                  {{ item.title }}
                </v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </template>
        </v-list>
      </template>

    </v-navigation-drawer>

    <!-- //Toolbar -->
    <v-toolbar
      :clipped-left="$vuetify.breakpoint.lgAndUp"
      color="white"
      class="elevation-0 app-toolbar"
      app
      fixed
      v-if="requiresAuth && user"
    >
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title class="ml-0 pl-3" v-if="application">
        <router-link :to="applicationDefaultRoute" tag="span" style="cursor: pointer">
          <div class="d-flex flex-row">
            <v-list-tile-avatar tile v-if="getApplicationIcon(application.icon)">
              <img :src="getApplicationIcon(application.icon)">
            </v-list-tile-avatar>
            <div class="pl-3 application-name">{{ application.name }}</div>
          </div>
        </router-link>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <template v-if="user">
        <v-menu offset-y left class="hidden-sm-and-down" v-if='applications.length > 1'>
          <v-btn
            icon
            slot="activator">
            <v-avatar size="32px" tile>
              <v-icon>apps</v-icon>
            </v-avatar>
          </v-btn>
          <v-list class="application-list scroll-y">
            <template v-for="application in applicationList" :v-bind="application.id">
              <v-list-tile
                avatar
                ripple
                :key="application.id"
                :href="$_getApplicationUrl(application.slug)">
                <v-list-tile-avatar tile v-if="getApplicationIcon(application.icon)">
                  <img :src="getApplicationIcon(application.icon)">
                </v-list-tile-avatar>
                <v-list-tile-avatar color="primary" v-else>
                  <span class="white--text headline">{{ $_getFirstChar(application.name) }}</span>
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <div class="d-flex flex-row">
                    <div class="pl-3">{{ application.name }}</div>
                  </div>
                </v-list-tile-content>
              </v-list-tile>
            </template>
          </v-list>
        </v-menu>

        <NotificationsList></NotificationsList>

        <v-menu offset-y left>
          <v-btn
            icon
            slot="activator">
            <v-avatar size="32px" tile>
              <v-icon>account_circle</v-icon>
            </v-avatar>
          </v-btn>
          <v-list>
            <v-list-tile
              :to="'/profile'">
              <v-list-tile-avatar>
                <v-icon>account_circle</v-icon>
              </v-list-tile-avatar>
              <v-list-tile-content>
                My Profile
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile
              @click="logout">
              <v-list-tile-avatar>
                <v-icon>lock</v-icon>
              </v-list-tile-avatar>
              <v-list-tile-content>
                Sign out
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-menu>
      </template>
      <template v-else>
        <v-btn icon :to="'login'">
          <v-icon>account_circle</v-icon>
        </v-btn>
      </template>
    </v-toolbar>
    <v-content>
      <v-container :fill-height="!requiresAuth" fluid :class="{'px-0': $vuetify.breakpoint.xsOnly }">
        <router-view></router-view>
      </v-container>
    </v-content>
    <span class="version">{{$_getAppVersion()}}</span>
  </v-app>
</template>

<script>
  import { sortBy } from 'lodash'
  import { mapGetters } from 'vuex'
  import get from 'lodash/get'
  const NotificationsList = () => import('./components/Shared/NotificationsList.vue')
  export default {
    components: {
      NotificationsList
    },
    name: 'App',
    data () {
      return {
        drawer: null,
        applicationMenuItems: [
          { title: 'Dashboard', path: 'dashboard', icon: 'dashboard', admin: false, color: 'primary' },
          { title: 'Forms', path: 'forms', icon: 'assignment', admin: false, color: 'blue' },
          { title: 'Form Templates', path: 'form-templates', icon: 'content_paste', admin: true, color: 'red' },
          { title: 'Users', path: 'users', icon: 'person', admin: true, color: 'green' },
          { title: 'Organisations', path: 'organisations', icon: 'people', admin: false, color: 'orange' },
          { title: 'Report Builder', path: 'report', icon: 'table_chart', admin: true, color: 'orange' },
          { title: 'Compare Forms', path: 'compare', icon: 'compare', admin: true, color: 'orange' },
          { title: 'Notes', path: 'notes', icon: 'note', admin: true, color: 'primary' },
          { title: 'Workflows', path: 'workflows', icon: 'merge_type', admin: true, color: 'primary' },
          { title: 'Settings', path: 'settings', icon: 'settings', admin: true }
        ],
        userMenuItems: [
          { title: 'Applications', path: 'applications', icon: 'apps', application: false },
          { title: 'My Profile', path: 'profile', icon: 'account_circle', application: true }
        ]
      }
    },
    computed: {
      ...mapGetters([
        'applications',
        'applicationBySlug',
        'roles',
        'user',
        'userIsSuperAdmin',
        'userIsAdmin'
      ]),
      application () {
        return this.applicationBySlug(this.$_slug)
      },
      requiresAuth () {
        return this.$route.meta.requiresAuth
      },
      isAdmin () {
        return this.userIsSuperAdmin || this.userIsAdmin(this.$_slug, this.user.id)
      },
      applicationDefaultRoute () {
        return get(this.application, 'default_route') || '/forms'
      },
      applicationList () {
        return sortBy(this.applications, 'name')
      }
    },
    methods: {
      getApplicationIcon (icon) {
        try {
          return JSON.parse(icon).url
        } catch (error) {
          return false
        }
      },
      logout () {
        this.$store.dispatch('logout')
        this.$router.push('/login')
      }
    },
    created () {
      if (this.user) {
        this.$store.dispatch('loadApplications')
      }
    }
  }
</script>
<style>
  body {
    background: no-repeat center center fixed; 
    -webkit-background-size: cover;
    -moz-background-size: cover;
    -o-background-size: cover;
    background-size: cover;
    background-color: #F4F4F4;
  }
  .theme--light.application {
    background: transparent !important;
  }
  .application .v-navigation-drawer--is-mobile, 
  .application .v-navigation-drawer--temporary {
    z-index: 30;
  }
  .application .app-toolbar {
    z-index: 25;
  }
  .application-name {
    line-height:48px;
  }
  .app-toolbar {
    border-bottom: solid thin rgba(0,0,0,.12) !important;
  }

  .checkmark__circle {
    stroke-dasharray: 166;
    stroke-dashoffset: 166;
    stroke-width: 2;
    stroke-miterlimit: 10;
    stroke: #7ac142;
    fill: none;
    animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
  }

  .checkmark {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    display: block;
    stroke-width: 2;
    stroke: #fff;
    stroke-miterlimit: 10;
    margin: 10% auto;
    box-shadow: inset 0 0 0 #7ac142;
    animation: fill 0.4s ease-in-out 0.4s forwards, scale 0.3s ease-in-out 0.9s both;
  }

  .checkmark__check {
    transform-origin: 50% 50%;
    stroke-dasharray: 48;
    stroke-dashoffset: 48;
    animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
  }

  @keyframes stroke {
    100% {
      stroke-dashoffset: 0;
    }
  }
  @keyframes scale {
    0%,
    100% {
      transform: none;
    }
    50% {
      transform: scale3d(1.1, 1.1, 1);
    }
  }
  @keyframes fill {
    100% {
      box-shadow: inset 0 0 0 30px #7ac142;
    }
  }

  .v-list.application-list {
    max-height:500px;
  }

  .version {
    bottom: 6px;
    font-size: 8px;
    opacity: .5;
    position: absolute;
    right: 6px;
  }
</style>
