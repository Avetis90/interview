<template>
  <div>

    <!-- // Upload Button -->
    <v-btn
      color="primary"
      outline
      block
      large
      @click.native="uploadDialog = true"
    >
      Upload Data
      <v-icon right dark>cloud_upload</v-icon>
    </v-btn>

    <!-- // Upload Dialog -->
    <v-dialog v-model="uploadDialog" max-width="600">
      <v-card>
        <v-card-title>
          <div class="title mb-2 mt-2">Upload Form Data</div>
        </v-card-title>

        <v-card-text>
          <v-layout row>
            <v-flex xs12>
              <input 
                id="upload" 
                type="file"
                ref="fileupload"
                accept=".xlsx"
                @change="changeFile"
                />
            </v-flex>
          </v-layout>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions>
          <v-layout row py-2>
            <v-flex xs12 class="text-xs-right">
              <v-btn 
                flat 
                color="secondary" 
                :disabled="!canCancel" 
                @click="cancel()"
              >
                Cancel
              </v-btn>
              <v-btn
                color="primary" 
                :disabled="!canUpload" 
                @click="upload"
              >
                Upload
              </v-btn>
            </v-flex>
          </v-layout>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <Snackbar color="success" :content="snackbar" :snackbar="snackbar" @dismissed="snackbar = false"></Snackbar>
  </div>
</template>

<script>
export default {
  props: {
    slug: String
  },
  data () {
    return {
      uploadDialog: false,
      uploading: false,
      file: null,
      snackbar: false
    }
  },
  computed: {
    canUpload () {
      return this.file && !this.uploading
    },
    canCancel () {
      return !this.uploading
    }
  },
  methods: {
    upload () {
      this.uploadDialog = false
      this.snackbar = 'File is being uploaded and queued for import.'
      this.uploading = true
      this.$store.dispatch('uploadApplicationFormData', {
        slug: this.slug,
        file: this.file
      })
      .then(() => {
        this.cancel()
      })
    },
    changeFile (e) {
      const files = e.target.files || e.dataTransfer.files
      this.file = files.length ? files[0] : false
    },
    cancel () {
      this.uploadDialog = false
      this.uploading = false
      this.file = null
      this.$refs.fileupload.type = 'text'
      this.$refs.fileupload.type = 'file'
    }
  }
}
</script>
