<template>
  <v-flex justify-space-around style='max-width: 500px' v-show='false'>
    <v-layout row wrap class='pb-4' align-baseline>
      <v-flex>
        Allow only specific file types
      </v-flex>
      <v-flex style='max-width: 40px'>
        <v-switch hide-details v-model='config.specificFileType'></v-switch>
      </v-flex>
    </v-layout>
    <v-layout row wrap align-baseline>
      <v-flex>
        Maximum number of files
      </v-flex>
      <v-flex style='max-width: 50px'>
        <v-select v-model='config.maxFilesNumber' :items='maxFilesNumberOptions'></v-select>
      </v-flex>
    </v-layout>
    <v-layout row wrap align-baseline>
      <v-flex>
        Maximum file size
      </v-flex>
      <v-flex style='max-width: 90px'>
        <v-select v-model='config.maxFileSize' :items='maxFileSizeOptions'></v-select>
      </v-flex>
    </v-layout>
  </v-flex>
</template>

<script>
  export default {
    name: 'file-upload',
    props: {
      'answers': {
        default: function () {
          return []
        }
      }
    },
    data () {
      return {
        config: {
          specificFileType: false,
          maxFilesNumber: 1,
          maxFileSize: '10 MB'
        },
        maxFilesNumberOptions: [1, 5, 10],
        maxFileSizeOptions: ['1 MB', '10 MB', '100 MB', '1 GB', '10 GB']
      }
    },
    mounted () {
      if (this.answers.length) {
        this.$emit('delete-answers')
      }
    }
  }
</script>
