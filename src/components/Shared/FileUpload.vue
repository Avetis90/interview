<template>
  <v-layout row>
    <v-flex xs12>
      <vue-dropzone
        ref="dropZone"
        :id="dropZoneId"
        :options="options"
        :destroyDropzone="false"
        @vdropzone-mounted="dropzoneMounted"
        @vdropzone-success="fileUploaded"
        @vdropzone-removed-file="fileRemoved"
      ></vue-dropzone>
    </v-flex>
  </v-layout>
</template>

<script>
  import vue2Dropzone from 'vue2-dropzone'
  import 'vue2-dropzone/dist/vue2Dropzone.min.css'
  import * as _ from 'lodash'

  export default {
    name: 'FileUpload',
    props: {
      // Files Array
      files: {
        type: Array,
        default: () => []
      },
      // Maxiumum Number of Files
      maxFiles: {
        type: Number,
        default: 1
      },
      // Maximum file size (MB)
      maxFilesize: {
        type: Number,
        default: 5000
      },
      // Accepted Files
      acceptedFiles: {
        type: String
      }
    },
    components: {
      vueDropzone: vue2Dropzone
    },
    data () {
      return {
        options: {
          url: process.env.API_URL + 'file',
          maxFilesize: this.maxFilesize,
          maxFiles: this.maxFiles,
          acceptedFiles: this.acceptedFiles,
          createImageThumbnails: false,
          addRemoveLinks: true,
          timeout: 1800000
        }
      }
    },
    computed: {
      dropZoneId () {
        return 'dropzone-' + _.uniqueId()
      }
    },
    methods: {
      dropzoneMounted () {
        _.forEach(this.files, (file) => {
          this.$refs.dropZone.manuallyAddFile(file, file.url || '#')
          this.addDownloadLink(file)
        })
      },
      fileUploaded (file, response) {
        this.files.push(response.file)
        file = { ...file, ...response.file }
        this.addDownloadLink(file)
        this.$emit('change', this.files)
      },
      fileRemoved (file, error, xhr) {
        _.remove(this.files, (obj) => {
          return obj.stored_name === file.stored_name
        })
        window.axios.delete(process.env.API_URL + 'file', {params: { name: file.stored_name }})
        this.$emit('change', this.files)
      },
      addDownloadLink (file) {
        let a = document.createElement('a')
        a.setAttribute('href', file.url)
        a.setAttribute('target', '_blank')
        a.setAttribute('class', 'download-link')
        a.setAttribute('download', file.name)
        a.setAttribute('title', 'Download File')
        file.previewTemplate.appendChild(a)
      }
    }
  }
</script>

<style scoped>
  .dropzone {
    padding: 0px;
    min-height: auto;
  }
  .dropzone >>> a.download-link {
    position:absolute;
    top:0px;
    width:100%;
    height:100%;
    z-index:20;
    cursor: pointer;
  }
  .dropzone >>> .dz-remove {
    width:170px;
  }
  .dropzone >>> .dz-remove:hover {
    background: rgba(1,1,1,0.25);
  }
</style>
