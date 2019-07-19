<template>
  <div class="application-loading" v-if="loading">
    <v-container fill-height>
      <v-layout row wrap align-center text-xs-center class="loading">
        <v-flex xs12>
          <img src="/static/logo.png" />
          <v-progress-linear
            :indeterminate="true"
            color="black"
          >
          </v-progress-linear>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
  export default {
    computed: {
      loading () {
        return this.$store.getters.loading
      }
    }
  }
</script>

<style>
.application-loading {
  position:absolute;
  top:0;
  bottom:0;
  left:0;
  right:0;
  z-index: 1000;
  background: rgba(245, 245, 245, 1)
}
.application-loading .loading {
  max-width:200px;
  margin:0 auto;
}
.application-loading .loading img {
  max-width:100%;
}
</style>
