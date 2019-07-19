<template>
  <v-layout row>
    <v-flex xs12>
      <v-text-field
        name="email"
        type="email"
        :value="message"
        @change="onSave($event)"
        :rules="[rules.email, validate]"
        :disabled="disabled"
      ></v-text-field>
    </v-flex>
  </v-layout>
</template>

<script>
  import validationMixin from '../ResponseValidationMixin'

  export default {
    name: 'Email',
    mixins: [validationMixin],
    props: ['question', 'answers', 'responses', 'disabled'],
    data () {
      return {
        rules: {
          email: value => {
            const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            return pattern.test(value) || 'Invalid e-mail.'
          }
        }
      }
    },
    methods: {
      onSave (value) {
        if (this.rules.email(value) !== true || this.validate(value) !== true) {
          return
        }

        if (this.responses.length) {
          this.$emit('update-response', [null, value, this.responses[0].id])
        } else {
          this.$emit('create-response', [null, value])
        }
      }
    },
    computed: {
      message () {
        if (this.responses.length) {
          return this.responses[0].response
        }
        return ''
      }
    }
  }
</script>
