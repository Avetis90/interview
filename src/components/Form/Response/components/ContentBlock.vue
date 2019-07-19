<template>
  <v-flex xs12 pb-3 px-3>
    <div v-html="sanitize(message)"></div>
  </v-flex>
</template>

<script>
  export default {
    props: ['question', 'formTemplateId', 'sectionId', 'index'],
    computed: {
      message () {
        return this.question.description
      }
    },
    methods: {
      sanitize (message) {
        // Override default sanitize settings to allow color in inline style attribute
        return this.$sanitize(message, {
          allowedAttributes: {
            '*': ['style'],
            a: [ 'href', 'name', 'target' ],
            img: [ 'src' ]
          },
          allowedStyles: {
            '*': {
              // Match HEX and RGB
              'color': [/^\#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/]
            }
          }
        })
      }
    }
  }
</script>
