<template>
  <v-card
    class="well mx-auto"
    max-width="600"
    @click.stop="onClicked()"
  >
      <v-card-title class="justify-center pt-4 pb-1">
        <span class="headline font-weight-bold">{{ title }}</span>
      </v-card-title>
      <v-card-text class="text-xs-center pt-1 pb-4">
        <p>{{ message }}</p>
        <v-icon>{{ icon }}</v-icon>
      </v-card-text>
  </v-card>
</template>

<script>
  export default {
    props: ['title', 'message', 'icon'],
    methods: {
      onClicked (item) {
        this.$emit('click')
      }
    }
  }
</script>

<style>
  .well {
    cursor: pointer;
    user-select: none;
  }

  .well .v-icon {
    font-size: 40px;
    padding: 12px;
    border-radius: 50%;
    border: 1px dashed rgba(0,0,0,.54);
    transition: 300ms all;
  }

  .well:hover .v-icon {
    color: #1976d2;
    border-color: #1976d2;
  }
</style>