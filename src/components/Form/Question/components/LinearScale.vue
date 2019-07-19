<template>
  <div>
    <v-container>
      <v-layout d-inline-flex>
        <v-flex>
          <v-select
            :value='start.id'
            :items='startItems'
            @change='updateAnswer("startId", $event)'
          ></v-select>
        </v-flex>
        <v-flex style='width: 50px' class='text-xs-center mt-4'>
          to
        </v-flex>
        <v-flex>
          <v-select
            :value='end.id'
            :items='endItems'
            @change='updateAnswer("endId", $event)'
          ></v-select>
        </v-flex>
      </v-layout>
    </v-container>
    <v-container>
      <v-layout d-inline-flex>
        <v-flex style='width: 50px' class='text-xs-center mt-4'>
          {{ start.id }}
        </v-flex>
        <v-flex xs12>
          <v-text-field
            label='Label (option)'
            :value='start.title'
            single-line
            @change='updateAnswer("startTitle", $event)'
          ></v-text-field>
        </v-flex>
      </v-layout>
    </v-container>
    <v-container>
      <v-layout d-inline-flex>
        <v-flex style='width: 50px' class='text-xs-center mt-4'>
          {{ end.id }}
        </v-flex>
        <v-flex xs12>
          <v-text-field
            label='Label (option)'
            :value='end.title'
            single-line
            @change='updateAnswer("endTitle", $event)'
          ></v-text-field>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
  export default {
    name: 'linear-scale',
    props: {
      'answers': {
        default: function () {
          return []
        }
      }
    },
    data () {
      return {
        startItems: ['0', '1'],
        endItems: ['2', '3', '4', '5', '6', '7', '8', '9', '10']
      }
    },
    mounted () {
      if (!this.answers.length) {
        this.$emit('create-answer', ['LinearScale--1', true])
        this.$emit('create-answer', ['LinearScale--5', false])
      } else if (this.answers.length !== 2 || this.answers[0].answer.substr(0, 11) !== 'LinearScale' || this.answers[1].answer.substr(0, 11) !== 'LinearScale') {
        this.$emit('delete-answers')
      }
    },
    computed: {
      start () {
        if (this.answers.length < 2) {
          return {
            id: 1,
            title: ''
          }
        }
        const start = this.answers[0].answer.substr(12)
        const index = start.lastIndexOf('-')
        return {
          id: start.substr(index + 1),
          title: start.substr(0, index)
        }
      },
      end () {
        if (this.answers.length < 2) {
          return {
            id: 5,
            title: ''
          }
        }
        const end = this.answers[1].answer.substr(12)
        const index = end.lastIndexOf('-')
        return {
          id: end.substr(index + 1),
          title: end.substr(0, index)
        }
      }
    },
    methods: {
      updateAnswer (type, value) {
        if (type === 'startId') {
          this.$emit('update-answer', [this.answers[0].id, 'LinearScale-' + this.start.title + '-' + value])
        } else if (type === 'startTitle') {
          this.$emit('update-answer', [this.answers[0].id, 'LinearScale-' + value + '-' + this.start.id])
        } else if (type === 'endId') {
          this.$emit('update-answer', [this.answers[1].id, 'LinearScale-' + this.end.title + '-' + value])
        } else if (type === 'endTitle') {
          this.$emit('update-answer', [this.answers[1].id, 'LinearScale-' + value + '-' + this.end.id])
        }
      }
    }
  }
</script>
