<template>

  <v-list class="form-tree">
    <v-list-group
      v-for="(item, index) in sectionList"
      v-model="item.active"
      :key="item.id"
      v-if="!isSectionTrigger(item) || formId === -1"
    >
      <v-list-tile
        slot="activator"
        @click="clickSection(item)"
        :class="'v-list__group__header_tile ' + (selectedSection.id === item.id ? 'primary--text' : '')">
        <v-list-tile-avatar>
          <v-icon v-if='sectionProgress(formTemplateId, item.id, formId) === 100'>check_circle</v-icon>
        </v-list-tile-avatar>
        <v-list-tile-content>
          <v-list-tile-title>
            {{ item.name }}
          </v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile
        v-for="subItem in children(item)"
        :key="subItem.name" @click="clickSection(subItem)"
        v-if="!isSectionTrigger(subItem) || formId === -1"
        :class="(selectedSection.id === subItem.id ? 'primary--text' : '')">
        <v-list-tile-avatar>
          <v-icon v-if='sectionProgress(formTemplateId, subItem.id, formId) === 100'>check_circle</v-icon>
        </v-list-tile-avatar>
        <v-list-tile-content>
          <v-list-tile-title class="ml-3">{{ subItem.name }}</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list-group>
  </v-list>

</template>

<script>
  import TriggerMixin from './TriggerMixin.js'
  import * as _ from 'lodash'
  export default {
    name: 'form-tree',
    props: ['formTemplateId', 'list', 'section', 'formId'],
    mixins: [TriggerMixin],
    data () {
      return {
        opened: true
      }
    },
    computed: {
      selectedSection () {
        return this.$store.getters.loadSelectedSection()
      },
      sectionList () {
        return _.forEach(this.list, item => {
          item.active = item.id && item.id === this.section.parent_section_id
          return item
        })
      }
    },
    methods: {
      children (item) {
        return _.sortBy(this.$store.getters.loadedChildrenSection(this.formTemplateId, item.id), element => {
          return element.order
        })
      },
      hasChildren (item) {
        return this.children(item).length === 0
      },
      clickSection (item) {
        if (this.formId === -1 || this.hasChildren(item)) {
          this.$emit('section-clicked', item)
        }
      },
      active (item) {
        return (this.section && item.id === this.section.id) ? 'active' : null
      }
    }
  }
</script>

<style scoped>
  .v-list__group {
    background: rgba(0,0,0,.04);
    border-bottom: 4px #ffffff solid;
  }

  .v-list__group__header_tile {
    flex: 1 1 auto!important;
    overflow: hidden;
  }

  .v-list {
    background:transparent;
  }

  .v-list__group__items {
    padding-left: 15px;
  }
  .v-list.form-tree .v-list__tile__title {
    height:auto;
    white-space: normal;
    line-height: 140%;
    overflow:visible;
  }
  .v-list.form-tree .v-list__group__header_tile {
    overflow:visible;
  }
  .v-list.form-tree >>> .v-list__tile--link {
    min-height:48px;
    height:auto;
  }
</style>
