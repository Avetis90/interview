<template>
  <v-layout row>
    <v-flex xs12>
      <v-text-field
        name="number"
        v-model="message"
        @change="onSave($event)"
        :rules="[rules.number, validate]"
        :disabled="disabled"
        :prefix="prefix"
        :suffix="suffix"
        :prepend-icon="prependIcon"
        :append-icon="appendIcon"
        :append-outer-icon="appendOuterIcon"
      ></v-text-field>
    </v-flex>
  </v-layout>
</template>

<script>
  import validationMixin from '../ResponseValidationMixin'

  export default {
    name: 'Number',
    mixins: [validationMixin],
    props: ['question', 'answers', 'responses', 'disabled', 'formTemplateId', 'sectionId', 'questionId'],
    data () {
      return {
        message: '',
        rules: {
          number: value => {
            return value === Math.floor(value).toString() || 'This value should be a whole number.'
          }
        }
      }
    },
    methods: {
      onSave (value) {
        if (this.validate(value) !== true) {
          return
        }

        if (this.rules.number(value) !== true) {
          value = parseInt(value)
          this.message = value
        }

        if (this.responses.length) {
          this.$emit('update-response', [null, value, this.responses[0].id])
        } else {
          this.$emit('create-response', [null, value])
        }
      }
    },
    computed: {
      meta () {
        const question = this.$store.getters.loadedQuestion(this.formTemplateId, this.sectionId, this.questionId)
        if (!question.metas.length) {
          return null
        }
        return question.metas[0]
      },
      value () {
        if (!this.meta) {
          return null
        }
        return JSON.parse(this.meta.metadata).value
      },
      prefix () {
        if (!this.meta || JSON.parse(this.meta.metadata).type !== 'Prefix') {
          return null
        }

        return this.value
      },
      suffix () {
        if (!this.meta || JSON.parse(this.meta.metadata).type !== 'Suffix') {
          return null
        }
        return this.value
      },
      prependIcon () {
        if (!this.meta || JSON.parse(this.meta.metadata).type !== 'Prepend') {
          return null
        }
        return this.value
      },
      appendIcon () {
        if (!this.meta || JSON.parse(this.meta.metadata).type !== 'Append') {
          return null
        }
        return this.value
      },
      appendOuterIcon () {
        if (!this.meta || JSON.parse(this.meta.metadata).type !== 'Append Outer') {
          return null
        }
        return this.value
      }
    },
    mounted () {
      if (this.responses.length) {
        this.message = this.responses[0].response
      }
    }
  }
</script>
