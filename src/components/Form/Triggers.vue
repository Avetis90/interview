<template>
  <v-layout row wrap>
    <template v-if="hasValidation()">
      <v-flex xs12 mt-2 mb-2>
        <v-divider></v-divider>
      </v-flex>
      <v-flex xs12 class="body-2">{{ this.type }} Logic</v-flex>
    </template>
    <v-flex xs12>
      <template v-for='(item, index) in triggers'>
        <trigger :formTemplateId="formTemplateId" :trigger="item" :questionOptions="questionOptions" :isLast="isLast(index)"></trigger>
        <v-divider v-if='!isLast(index)'></v-divider>
      </template>

      <v-layout wrap>
        <v-btn dark block color="primary" @click="createTrigger">
          <v-icon dark>add</v-icon>
          Add {{ this.type }} Logic
        </v-btn>
      </v-layout>
    </v-flex>
  </v-layout>
</template>

<script>
  import * as _ from 'lodash'
  const trigger = () => import('./Trigger')
  export default {
    props: ['formTemplateId', 'question', 'questionOptions', 'type'],
    components: {
      trigger
    },
    computed: {
      triggers () {
        let triggers = this.$store.getters.loadedQuestionTrigger(this.formTemplateId, this.question.id)
        triggers = triggers.filter((trigger) => {
          if (this.type === 'Section') {
            return trigger.type === 'Section'
          } else {
            return trigger.type !== 'Section'
          }
        })
        return _.sortBy(triggers, element => {
          return element.order
        })
      },
      comparators () {
        return this.$store.getters.comparators
      }
    },
    methods: {
      createTrigger () {
        this.$store.dispatch('createTrigger', {
          formTemplateId: this.formTemplateId,
          questionId: this.question.id,
          parentQuestionId: this.questionOptions[0].id,
          comparatorId: this.comparators[0].id,
          operator: 0,
          type: this.type
        })
      },
      isLast (index) {
        return this.triggers.length - 1 === index
      },
      hasValidation () {
        return this.triggers.length > 0
      }
    }
  }
</script>