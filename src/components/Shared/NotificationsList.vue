<template>
  <v-menu offset-y left class="hidden-sm-and-down">
    <v-btn
      icon
      slot="activator">
      <v-badge 
        color="red"
        overlap
        :value="hasNotifications"
        >
        <template v-slot:badge>
          <span>{{ numberOfNotifications }}</span>
        </template>
        <v-avatar size="32px" tile>
          <v-icon>notifications</v-icon>
        </v-avatar>
      </v-badge>
    </v-btn>
    <v-list class="notification-list scroll-y">

      <template v-if="hasNotifications">
        <v-list-tile
          v-for="notification in notifications"
          :to="notification.path"
          :key="notification.title"
        >
          <v-list-tile-action>
            <v-icon size="30">{{ notification.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>
              {{ notification.title }}
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </template>

      <template v-else>
        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>You have no notifications.</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </template>

    </v-list>
  </v-menu>
</template>

<script>
import CoreMixin from '../../mixins/CoreMixin'
import { mapGetters } from 'vuex'
export default {
  name: 'NotificationsList',
  mixins: [CoreMixin],
  computed: {
    ...mapGetters([
      'notesByUserId'
    ]),
    notifications () {
      let notifications = []
      const dueNotes = this.notesByUserId(this.$_slug, this.$_user.id).filter(note => {
        return note.task_due_at && new Date(note.task_due_at) <= new Date()
      })
      dueNotes.forEach(note => {
        notifications.push({ title: note.task, icon: 'note', path: '/notes' })
      })
      return notifications
    },
    numberOfNotifications () {
      return this.notifications.length
    },
    hasNotifications () {
      return this.numberOfNotifications > 0
    }
  },
  methods: {},
  created () {
    this.$store.getters.notes(this.$_slug)
  }
}
</script>
