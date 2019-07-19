<template>
  <v-dialog v-model="show" max-width="600px">

    <v-card>

      <!-- //Title -->
      <v-card-title>
        <div class="title mb-2 mt-2">Duplicate</div>
      </v-card-title>

      <!-- //Content -->
      <v-card-text>
        <v-text-field
          name="name"
          label="Name"
          id="name"
          v-model="name"
          required>
        </v-text-field>
      </v-card-text>

      <!-- //Actions -->
      <v-divider></v-divider>
      <v-card-actions>
        <v-layout row py-2>
          <v-flex xs12 class="text-xs-right">
            <v-btn flat @click.stop="close">Cancel</v-btn>
            <v-btn color="primary" @click.stop="onDuplicate">Save</v-btn>
          </v-flex>
        </v-layout>
      </v-card-actions>
      
    </v-card>
  </v-dialog>
</template>

<script>
  export default {
    props: ['visible', 'defaultName'],
    data () {
      return {
        name: ''
      }
    },
    watch: {
      visible (value) {
        this.name = this.defaultName
      }
    },
    computed: {
      show: {
        get () {
          return this.visible
        },
        set (value) {
          if (!value) {
            this.$emit('close')
          }
        }
      }
    },
    methods: {
      onDuplicate () {
        this.$emit('action', this.name)
        this.reset()
      },
      close () {
        this.reset()
      },
      reset () {
        this.show = false
        this.name = ''
      }
    }
  }
</script>
