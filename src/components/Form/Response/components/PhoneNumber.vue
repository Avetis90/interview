<template>
  <v-layout row>
    <v-flex xs12>
      <v-text-field
        name="number"
        v-model="message"
        @change="onSave($event)"
        :rules="[rules.phoneNumber]"
        :disabled="disabled"
      ></v-text-field>
    </v-flex>
  </v-layout>
</template>

<script>
  export default {
    name: 'PhoneNumber',
    props: ['question', 'answers', 'responses', 'disabled', 'formTemplateId', 'sectionId', 'questionId'],
    data () {
      return {
        message: '',
        rules: {
          phoneNumber: value => {
            return /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/.test(value) || 'This value should be a whole phone number.'
          }
        }
      }
    },
    methods: {
      onSave (value) {
        if (this.rules.phoneNumber(value) !== true) {
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
