<template>
  <v-dialog width="600px" v-model="editOrganisation">
    <div slot="activator">Edit Organisation</div>
    <v-card>

      <!-- //Title -->
      <v-card-title>
        <div class="title mb-2 mt-2">Edit Organisation</div>
      </v-card-title>

      <!-- //Content -->
      <v-card-text>
        <v-layout row>
          <v-flex xs12>
            <v-text-field
              name="name"
              label="Name"
              id="name"
              v-model="editedName"
              required></v-text-field>
          </v-flex>
        </v-layout>
      </v-card-text>

      <!-- //Actions -->
      <v-divider></v-divider>
      <v-card-actions>
        <v-layout row py-2>
          <v-flex xs12 class="text-xs-right">
            <v-btn flat @click="onCancel">Cancel</v-btn>
            <v-btn flat class="primary" @click="onSaveChanges">Save</v-btn>
          </v-flex>
        </v-layout>
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>

<script>
  export default {
    props: ['organisation', 'slug'],
    data () {
      return {
        id: this.organisation.id,
        editOrganisation: false,
        editedName: this.organisation.name
      }
    },
    methods: {
      onSaveChanges () {
        if (this.editedName.trim() === '') {
          return
        }
        this.editOrganisation = false
        this.$store.dispatch('updateOrganisation',
          {
            slug: this.slug,
            id: this.id,
            name: this.editedName
          })
      },
      onCancel () {
        this.editedName = this.organisation.name
        this.editOrganisation = false
      }
    }
  }
</script>
