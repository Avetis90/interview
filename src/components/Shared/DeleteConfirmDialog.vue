<template>
  <v-dialog v-model="show" max-width="600px">

    <v-card>

      <!-- //Title -->
      <v-card-title>
        <div class="title mb-2 mt-2">Delete</div>
      </v-card-title>

      <!-- //Content -->
      <v-card-text>
        Are you sure you want to delete?
      </v-card-text>

      <!-- //Actions -->
      <v-divider></v-divider>
      <v-card-actions>
        <v-layout row py-2>
          <v-flex xs12 class="text-xs-right">
            <v-btn flat @click.stop="close">Cancel</v-btn>
            <v-btn color="primary" @click.stop="onDelete">Delete</v-btn>
          </v-flex>
        </v-layout>
      </v-card-actions>
      
    </v-card>
  </v-dialog>
</template>

<script>
  export default {
    props: ['visible'],
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
      onDelete () {
        this.$emit('delete-action')
        this.reset()
      },
      close () {
        this.reset()
      },
      reset () {
        this.show = false
      }
    }
  }
</script>
