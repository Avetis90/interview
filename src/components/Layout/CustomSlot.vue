<template>
  <v-layout row wrap class="my-3">
    <template v-if="mode">
      <quill-editor
        v-model="text"
        :options="editorOption"
        @blur="updateText"
        class="mb-5"
      >
      </quill-editor>
    </template>
    <template v-else>
      <div v-html="$sanitize(text)" v-if="text"></div>
    </template>
  </v-layout>
</template>

<script>
  import LayoutMixin from './LayoutMixin'
  export default {
    name: 'CustomSlot',
    props: ['type', 'mode'],
    mixins: [LayoutMixin],
    data () {
      return {
        text: '',
        editorOption: {}
      }
    },
    mounted () {
      this.text = this.metaValue(this.type)
    },
    methods: {
      updateText () {
        if (!this.meta) {
          const newMeta = {}
          newMeta[this.type] = this.text
          this.createMeta(JSON.stringify(newMeta))
        } else {
          try {
            const oldMetaData = JSON.parse(this.meta.metadata)
            oldMetaData[this.type] = this.text
            this.updateMeta(JSON.stringify(oldMetaData))
          } catch (error) {
            return false
          }
        }
      }
    }
  }
</script>

<style>
  .quill-editor {
    width: 100%;
  }
</style>
