<template>
  <v-dialog v-model="show" max-width="600px">

    <v-card>

      <!-- //Title -->
      <v-card-title>
        <div class="title mb-2 mt-2">Move</div>
      </v-card-title>

      <!-- //Content -->
      <v-card-text>
        <v-select
          :items="sections"
          label="Sections"
          item-text="name"
          item-value="id"
          v-model="selectedSectionId"
        ></v-select>

        <v-select
          :items="items"
          label="Before"
          item-text="question"
          item-value="order"
          v-model="order"
          v-if="flag==='Question'"
        ></v-select>

        <v-select
          :items="items"
          label="Before"
          item-text="name"
          item-value="order"
          v-model="order"
          v-if="flag==='Section'"
        ></v-select>
      </v-card-text>

      <!-- //Actions -->
      <v-divider></v-divider>
      <v-card-actions>
        <v-layout row py-2>
          <v-flex xs12 class="text-xs-right">
            <v-btn flat @click.stop="close">Cancel</v-btn>
            <v-btn color="primary" @click.stop="onMove">Select</v-btn>
          </v-flex>
        </v-layout>
      </v-card-actions>
      
    </v-card>
  </v-dialog>
</template>

<script>
  export default {
    props: ['visible', 'formTemplateId', 'sectionId', 'flag'],
    data () {
      return {
        selectedSectionId: null,
        order: 1
      }
    },
    computed: {
      show: {
        get () {
          return this.visible
        },
        set (value) {
          if (!value) {
            this.selectedSectionId = null
            this.order = 1
            this.$emit('close')
          }
        }
      },
      sections () {
        return this.$store.getters.loadedSections(this.formTemplateId).filter((section) => {
          if (this.flag === 'Question') {
            return !this.$store.getters.loadedChildrenSection(this.formTemplateId, section.id).length
          } else {
            if (section.id === this.sectionId) {
              return false
            }
            return !section.questions.length
          }
        })
      },
      items () {
        if (this.selectedSectionId === null && this.flag === 'Question') {
          return []
        }

        let items = []
        if (this.flag === 'Question') {
          items = this.$store.getters.loadedSection(this.formTemplateId, this.selectedSectionId).questions.slice(0)
        } else {
          items = this.$store.getters.loadedChildrenSection(this.formTemplateId, this.selectedSectionId)
        }

        let order = 1
        if (items.length) {
          order = items[items.length - 1].order + 1
        }

        if (this.flag === 'Question') {
          items.push({question: 'At Last', order: order})
        } else {
          items.push({name: 'At Last', order: order})
        }

        return items
      }
    },
    methods: {
      onMove () {
        this.$emit('move-action', [this.selectedSectionId, this.order])
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
