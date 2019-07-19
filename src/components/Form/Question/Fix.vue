<template>
  <v-layout row wrap justify-space-around>
    <v-flex xs12 mt-2 mb-2>
      <v-divider />
    </v-flex>
    <v-flex xs12 body-2>Affix Icons</v-flex>
    <v-flex xs6>
      <v-autocomplete
        :items="types"
        label="Type"
        v-model="type"
        @change="onFix"
      ></v-autocomplete>
    </v-flex>
    <v-flex xs5 offset-xs1>
      <v-text-field
        label="Content"
        v-model="value"
        @change="onFix"
      ></v-text-field>
    </v-flex>
    <v-flex xs12>
      <p class="text-xs-right">
        <a href="https://material.io/tools/icons/" target="_blank">View available material design icons</a>
      </p>
    </v-flex>
  </v-layout>
</template>

<script>
  export default {
    props: ['questionId', 'formTemplateId', 'sectionId'],
    name: 'Fix',
    data () {
      return {
        types: [
          'Default',
          'Prefix',
          'Suffix',
          'Prepend',
          'Append',
          'Append Outer'
        ],
        type: 'Default',
        value: null
      }
    },
    mounted () {
      if (!this.meta) {
        return
      }
      const metadata = JSON.parse(this.meta.metadata)
      this.type = metadata.type
      this.value = metadata.value
    },
    watch: {
      meta (value) {
        if (!value) {
          return
        }
        const metadata = JSON.parse(value.metadata)
        this.type = metadata.type
        this.value = metadata.value
      }
    },
    computed: {
      question () {
        return this.$store.getters.loadedQuestion(this.formTemplateId, this.sectionId, this.questionId)
      },
      meta () {
        if (!this.question.metas.length) {
          return null
        }
        return this.question.metas[0]
      }
    },
    methods: {
      onFix () {
        if (this.type === 'Default') {
          this.removeFix()
          return
        }

        if (this.meta) {
          this.updateFix()
        } else {
          this.createFix()
        }
      },
      createFix () {
        this.$store.dispatch('createMeta', {
          metadata: JSON.stringify({value: this.value, type: this.type}),
          metableId: this.questionId,
          metableType: 'questions'
        })
          .then(response => {
            this.$store.dispatch('loadQuestion', {
              formTemplateId: this.formTemplateId,
              sectionId: this.sectionId,
              id: this.questionId
            })
          })
      },
      updateFix () {
        this.$store.dispatch('updateMeta', {
          id: this.meta.id,
          metadata: JSON.stringify({value: this.value, type: this.type}),
          metableId: this.questionId,
          metableType: 'questions'
        })
          .then(response => {
            this.$store.dispatch('loadQuestion', {
              formTemplateId: this.formTemplateId,
              sectionId: this.sectionId,
              id: this.questionId
            })
          })
      },
      removeFix () {
        if (!this.meta) {
          return
        }
        this.$store.dispatch('deleteMeta', {
          id: this.meta.id
        })
          .then(response => {
            this.$store.dispatch('loadQuestion', {
              formTemplateId: this.formTemplateId,
              sectionId: this.sectionId,
              id: this.questionId
            })
          })
        this.value = null
      }
    }
  }
</script>
