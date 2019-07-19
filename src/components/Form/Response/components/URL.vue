<template>
  <v-layout row>
    <v-flex xs12>
      <v-text-field
        v-model="message"
        @change="onSave($event)"
        :rules="[rules.url]"
        :disabled="disabled"
      >
      </v-text-field>
    </v-flex>
  </v-layout>
</template>

<script>
  export default {
    name: 'URL',
    props: ['question', 'answers', 'responses', 'disabled', 'formTemplateId', 'sectionId', 'questionId'],
    data () {
      return {
        message: '',
        rules: {
          url: value => {
            return /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/.test(value) || 'This value should be a whole URL.'
          }
        }
      }
    },
    methods: {
      onSave (value) {
        if (this.rules.url(value) !== true) {
          return
        }

        if (this.responses.length) {
          this.$emit('update-response', [null, value, this.responses[0].id])
        } else {
          this.$emit('create-response', [null, value])
        }
      }
    },
    mounted () {
      if (this.responses.length) {
        this.message = this.responses[0].response
      }
    }
  }
</script>
