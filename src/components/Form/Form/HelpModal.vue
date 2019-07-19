<template>
  <v-dialog v-model="show" max-width="600px">

    <v-card>

      <!-- //Title -->
      <v-card-title>
        <div class="title mb-2 mt-2">Help</div>
      </v-card-title>

      <!-- //Content -->
      <v-card-text v-html="content" />

      <!-- //Actions -->
      <v-divider></v-divider>
      <v-card-actions>
        <v-layout row py-2>
          <v-flex xs12 class="text-xs-right">
            <v-btn flat @click.stop="close">Close</v-btn>
          </v-flex>
        </v-layout>
      </v-card-actions>
      
    </v-card>
  </v-dialog>
</template>

<script>
  export default {
    props: ['visible', 'content'],
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
      close () {
        this.show = false
      }
    }
  }
</script>
