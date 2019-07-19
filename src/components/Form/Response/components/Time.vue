<template>
  <v-layout row>
    <v-flex xs12>

      <v-dialog
        ref="dialog"
        v-model="modal"
        :return-value.sync="time"
        lazy
        full-width
        width="290px"
      >
        <v-text-field
          slot="activator"
          v-model="time"
          prepend-icon="access_time"
          readonly
          :disabled="disabled"
        ></v-text-field>
        <v-time-picker
          v-model="time"
          :allowed-minutes="() => {return !disabled}"
          :allowed-hours="() => {return !disabled}"
        >
          <v-spacer></v-spacer>
          <v-btn flat color="primary" @click="modal = false">Cancel</v-btn>
          <v-btn flat color="primary" @click="$refs.dialog.save(time)">OK</v-btn>
        </v-time-picker>
      </v-dialog>

    </v-flex>
  </v-layout>
</template>

<script>
  export default {
    name: 'time-component',
    props: ['question', 'answers', 'responses', 'disabled'],
    data () {
      return {
        timeCnt: 0,
        modal: false,
        time: this.responses.length ? this.responses[0].response : null
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
    },
    watch: {
      time (value) {
        if (this.timeCnt === 1) {
          this.timeCnt = 0
          if (this.responses.length) {
            this.$emit('update-response', [null, this.time, this.responses[0].id])
          } else {
            this.$emit('create-response', [null, this.time])
          }
        } else {
          this.timeCnt++
        }
      }
    }
  }
</script>
