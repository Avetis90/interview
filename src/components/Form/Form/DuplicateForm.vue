<template>
  <v-dialog v-model="show" max-width="600px">

    <v-card>

      <!-- //Title -->
      <v-card-title>
        <div class="title mb-2 mt-2">Form Duplicated</div>
      </v-card-title>

      <!-- //Content -->
      <v-card-text>
        <v-layout>
          <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
            <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
        </v-layout>
      </v-card-text>

      <!-- //Actions -->
      <v-divider></v-divider>
      <v-card-actions>
        <v-layout row py-2>
          <v-flex xs12 class="text-xs-right">
            <v-btn flat @click.stop="goToDuplicate">Go to Duplicated Form</v-btn>
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
      },
      goToDuplicate () {
        this.show = false
        this.$router.push('/forms/' + this.content)
      }
    }
  }
</script>
