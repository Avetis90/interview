<template>
  <v-layout row wrap>
    <v-flex xs12>
      <v-layout row class="pa-2">
        <v-flex xs8 offset-xs2>
          <v-layout row>
            <v-flex 
              v-for="n in end.id" 
              :key="n" 
              v-if="n+1!=start.id" 
              :style="'width: ' + ((1/end.id)*100) + '%; text-align:center;'">
              <span class="optionLabel">{{ n }}</span>
            </v-flex>
          </v-layout>
        </v-flex>
      </v-layout>
      <v-layout row class="pa-2">
        <v-flex xs2 class="text-xs-left scale-title">{{ start.title }}</v-flex>
        <v-flex xs8>
          <v-layout row>
            <v-radio-group v-model="optionModel" row class="scale-radio-group">
              <v-radio
                color="info"
                :disabled="disabled"
                v-for="n in end.id" 
                :key="n" v-if="n+1!=start.id" 
                :value="n"
                :style="'width: ' + ((1/end.id)*100) + '%; margin:0px;'"
                @change="onSave(n)
              "></v-radio>
            </v-radio-group>
          </v-layout>
        </v-flex>
        <v-flex xs2 class="text-xs-right scale-title">{{ end.title }}</v-flex>
      </v-layout>
    </v-flex>
  </v-layout>
</template>

<script>
  export default {
    name: 'linear-scale',
    props: ['question', 'answers', 'responses', 'disabled'],
    data () {
      return {
        optionModel: this.responses.length ? parseInt(this.responses[0].response) : 0
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
          id: parseInt(start.substr(index + 1)),
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
          id: parseInt(end.substr(index + 1)),
          title: end.substr(0, index)
        }
      }
    },
    methods: {
      onSave (value) {
        if (this.responses.length) {
          this.$emit('update-response', [null, value, this.responses[0].id])
        } else {
          this.$emit('create-response', [null, value])
        }
      }
    }
  }
</script>
<style>
.scale-radio-group .v-input__control {
  width:100%;
}
.scale-radio-group .v-input--selection-controls__input {
  margin:0 auto;
}
.scale-title {
  margin-top: 16px;
  padding-top: 4px;
}
</style>
