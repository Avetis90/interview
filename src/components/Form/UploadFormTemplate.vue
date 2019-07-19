<template>
  <v-dialog width="600px" v-model="uploadFormTemplate">
    <div slot="activator">
      Upload Form Template
    </div>

    <v-card>
      <!-- //Title -->
      <v-card-title>
        <div class="title mb-2 mt-2">Upload Form Template</div>
      </v-card-title>

      <!-- // Content -->
      <v-card-text>
        <v-layout row v-if="!completed">
          <v-flex xs12>
            <input 
              id="upload" 
              type="file" 
              accept=".csv, .xls, .xlsx"
              data-multiple-caption="{count} files selected"
              @change="onFileChange"
              :disabled="loading"
              />
          </v-flex>
        </v-layout>

        <v-layout row v-if="file && !completed">
          <v-flex text-xs-center xs12 py-2>
            <v-btn 
              class="primary"
              @click="onSaveChanges" 
              :disabled="loading">
                Start Upload
              </v-btn>
          </v-flex>
        </v-layout>

        <v-layout row v-if="loading">
          <v-flex text-xs-center xs12>
            <v-progress-linear
              indeterminate
            >
            </v-progress-linear>
          </v-flex>
        </v-layout>

        <v-layout row v-if="completed">
          <v-flex xs12>
            <v-alert
              :value="true"
              type="success"
            >
              {{ this.response}}
            </v-alert>
          </v-flex>
        </v-layout>

      </v-card-text>

      <!-- //Actions -->
      <v-divider></v-divider>
      <v-card-actions>
        <v-layout row py-2>
          <v-flex xs12 class="text-xs-right">      
            <v-btn
              flat
              @click="onCancel"
              :disabled="loading">Close</v-btn>
          </v-flex>
        </v-layout>
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>

<script>
  export default {
    props: ['formTemplate', 'slug'],
    data () {
      return {
        uploadFormTemplate: false,
        id: this.formTemplate.id,
        file: null,
        completed: false,
        response: null
      }
    },
    methods: {
      onSaveChanges () {
        if (!this.file) {
          return
        }

        this.$store.dispatch('uploadFormTemplate', {
          slug: this.slug,
          id: this.id,
          file: this.file
        })
        .then(response => {
          this.response = response.data.upload
          this.completed = true
          this.$store.dispatch('loadSections', this.id)
          this.$store.dispatch('selectSection', null)
        })
      },
      onFileChange (e) {
        const files = e.target.files || e.dataTransfer.files
        this.file = files.length ? files[0] : false
      },
      onCancel () {
        this.uploadFormTemplate = false
        this.file = null
        this.completed = false
        this.response = null
      }
    },
    computed: {
      loading () {
        return this.$store.getters.loading
      }
    }
  }
</script>
