<template>
  <v-layout row wrap>
    <v-flex xs12>
      <FileUpload
        v-bind:maxFiles="maxFiles"
        v-bind:maxFilesize="maxFilesize"
        v-bind:files="files"
        @change="onSave(files)"
      ></FileUpload>
    </v-flex>
  </v-layout>
</template>

<script>
  export default {
    name: 'fileupload',
    props: ['question', 'formId', 'responses', 'disabled'],
    data () {
      return {
        files: this.setFiles(this.responses),
        maxFiles: 1,
        maxFilesize: 5000
      }
    },
    methods: {
      setFiles (data) {
        let files = []
        try {
          // JSON array of files
          files = JSON.parse(data[0].response)
        } catch (error) {
          // String file name
          let response = data.length ? data[0].response : []
          if (response.length) {
            let filename = response.split('/')
            files.push({
              url: response,
              path: response,
              stored_name: filename[filename.length - 1],
              name: filename[filename.length - 1]
            })
          }
        }
        files = files || []
        return files
      },
      onSave (value) {
        let files = value.length ? JSON.stringify(value) : null
        if (this.responses.length) {
          this.$emit('update-response', [null, files, this.responses[0].id])
        } else {
          this.$emit('create-response', [null, files])
        }
      }
    }
  }
</script>
