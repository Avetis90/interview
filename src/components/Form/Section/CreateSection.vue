<template>
  <v-dialog width="600px" v-model="createSection">
    <div slot="activator">
      Create Section
    </div>

    <v-card>

      <!-- //Title -->
      <v-card-title>
        <div class="title mb-2 mt-2">Create Section</div>
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
            <v-btn class="primary" @click="onSaveChanges" :disabled="loading" :loading="loading">
                Save
              </v-btn>
          
          </v-flex>
        </v-layout>
      </v-card-actions>
      
    </v-card>

  </v-dialog>
</template>

<script>
  export default {
    props: ['parentSectionId', 'formTemplateId'],
    data () {
      return {
        createSection: false,
        editedName: ''
      }
    },
    methods: {
      onSaveChanges () {
        if (this.editedName.trim() === '') {
          return
        }
        this.createSection = false
        this.$store.dispatch('createSection',
          {
            formTemplateId: this.formTemplateId,
            parentSectionId: this.parentSectionId,
            name: this.editedName
          })
        this.editedName = ''
      },
      onCancel () {
        this.editedName = ''
        this.createSection = false
      }
    },
    computed: {
      loading () {
        return this.$store.getters.loading
      }
    }
  }
</script>
