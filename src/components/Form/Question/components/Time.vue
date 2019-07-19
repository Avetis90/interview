<template>
  <v-layout row>
    <v-flex xs4>
      <v-text-field
        value='Time'
        append-icon='schedule'
        disabled
      ></v-text-field>
    </v-flex>
  </v-layout>
</template>

<script>
  export default {
    name: 'time-component',
    props: {
      'answers': {
        default: function () {
          return []
        }
      }
    },
    mounted () {
      if (this.answers.length) {
        this.$emit('delete-answers')
      }
    }
  }
</script>
