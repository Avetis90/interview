<template>
  <v-layout row wrap>
    <v-flex xs12 md3 pa-2>
      <v-btn class="ma-0" block color="info" @click="prev(section)" :disabled="prevAble">Prev</v-btn>
    </v-flex>
    <v-spacer></v-spacer>
    <v-flex xs12 md3 pa-2 ma-0>
      <v-btn class="ma-0" block color="info" @click="next(section)" :disabled="nextAble">Next</v-btn>
    </v-flex>
  </v-layout>
</template>

<script>
  import TriggerMixin from './TriggerMixin.js'
  import SectionOperation from './SectionOperation.js'
  import * as _ from 'lodash'
  export default {
    name: 'formNavigation',
    props: ['slug', 'formTemplateId', 'formId'],
    mixins: [TriggerMixin, SectionOperation],
    computed: {
      sections () {
        return this.$store.getters.loadedSections(this.formTemplateId)
      },
      list: {
        get () {
          return _.sortBy(this.$store.getters.loadedChildren(this.formTemplateId, null), element => {
            return element.order
          })
        },
        set (value) {
          // TODO: draggable
        }
      },
      prevAble () {
        if (!this.list.length || !this.section) {
          return true
        }
        if (this.formId === -1) {
          return this.section === this.sections[0]
        } else {
          let repeat = true
          let ptSection = this.list[0]
          let children = this.list

          while (repeat) {
            if (children.length > 0) {
              if (children[0].answers) {
                repeat = false
              } else {
                let index = 0
                while (index < children.length) {
                  if (!this.isSectionTrigger(children[index])) {
                    ptSection = children[index]
                    break
                  }
                  index++
                }
                if (index === children.length) {
                  return true
                }
              }
            } else {
              repeat = false
            }
            children = _.sortBy(this.$store.getters.loadedChildren(this.formTemplateId, ptSection.id), element => {
              return element.order
            })
          }
          return this.section === ptSection
        }
      },
      nextAble () {
        if (!this.list.length || !this.section) {
          return true
        }

        let repeat = true
        let ptSection = this.list[this.list.length - 1]
        let children = this.list

        while (repeat) {
          if (children.length > 0) {
            if (children[children.length - 1].answers) {
              repeat = false
            } else {
              let index = children.length - 1
              while (index > -1) {
                if (this.formId === -1 || !this.isSectionTrigger(children[index])) {
                  ptSection = children[index]
                  break
                }
                index--
              }
              if (index === -1) {
                return true
              }
            }
          } else {
            repeat = false
          }
          children = _.sortBy(this.$store.getters.loadedChildren(this.formTemplateId, ptSection.id), element => {
            return element.order
          })
        }

        return this.section === ptSection
      },
      section () {
        let rtSection = this.$store.getters.loadSelectedSection()
        if (!rtSection) {
          const sections = this.list
          if (sections.length) {
            if (this.formId === -1) {
              rtSection = sections[0]
            } else {
              rtSection = this.getFirstChildSection(this.formTemplateId, sections[0])
            }
            this.$store.dispatch('selectSection', rtSection)
          }
        } else {
          if (this.formId !== -1) {
            const children = _.sortBy(this.$store.getters.loadedChildren(this.formTemplateId, rtSection.id), element => {
              return element.order
            })
            if (children.length > 0 && children[0].questions) {
              rtSection = this.getFirstChildSection(this.formTemplateId, rtSection)
              this.$store.dispatch('selectSection', rtSection)
            }
          }
        }
        return rtSection
      }
    },
    methods: {
      prev (rtSection) {
        if (!rtSection) {
          return
        }
        do {
          let slibings = _.sortBy(this.$store.getters.loadedChildrenSection(this.formTemplateId, rtSection.parent_section_id), element => {
            return element.order
          })
          let index = slibings.findIndex(section => {
            return section.id === rtSection.id
          })
          if (this.formId === -1) {
            if (index) {
              rtSection = slibings[index - 1]
              rtSection = this.getLastChildSection(this.formTemplateId, rtSection)
            } else if (rtSection.parent_section_id) {
              rtSection = this.$store.getters.loadedSection(this.formTemplateId, rtSection.parent_section_id)
            }
          } else {
            if (index) {
              rtSection = slibings[index - 1]
            } else if (rtSection.parent_section_id) {
              while (!index) {
                if (!rtSection.parent_section_id) {
                  break
                }
                rtSection = this.$store.getters.loadedSection(this.formTemplateId, rtSection.parent_section_id)
                slibings = _.sortBy(this.$store.getters.loadedChildrenSection(this.formTemplateId, rtSection.parent_section_id), element => {
                  return element.order
                })
                index = slibings.findIndex(section => {
                  return section.id === rtSection.id
                })
              }
              if (rtSection.parent_section_id || index) {
                rtSection = slibings[index - 1]
              } else {
                rtSection = this.getFirstChildSection(this.formTemplateId, this.list[0])
              }
              if (!this.isSectionTrigger(rtSection)) {
                rtSection = this.getLastChildSection(this.formTemplateId, rtSection)
              }
            }
          }
        } while (this.isSectionTrigger(rtSection) && this.formId !== -1)
        scroll(0, 0)
        this.$store.dispatch('selectSection', rtSection)
      },
      next (rtSection) {
        if (!rtSection) {
          return
        }
        do {
          let slibings = _.sortBy(this.$store.getters.loadedChildrenSection(this.formTemplateId, rtSection.parent_section_id), element => {
            return element.order
          })
          let index = slibings.findIndex(section => {
            return section.id === rtSection.id
          })
          if (this.formId === -1) {
            let children = _.sortBy(this.$store.getters.loadedChildrenSection(this.formTemplateId, rtSection.id), element => {
              return element.order
            })
            if (children.length) {
              rtSection = children[0]
            } else if (index < slibings.length - 1) {
              rtSection = slibings[index + 1]
            } else if (rtSection.parent_section_id) {
              while (index === slibings.length - 1) {
                if (!rtSection.parent_section_id) {
                  break
                }
                rtSection = this.$store.getters.loadedSection(this.formTemplateId, rtSection.parent_section_id)
                slibings = _.sortBy(this.$store.getters.loadedChildrenSection(this.formTemplateId, rtSection.parent_section_id), element => {
                  return element.order
                })
                index = slibings.findIndex(section => {
                  return section.id === rtSection.id
                })
              }
              if (rtSection.parent_section_id || index !== slibings.length - 1) {
                rtSection = slibings[index + 1]
              } else {
                rtSection = this.list[this.list.length - 1]
                rtSection = this.getLastChildSection(this.formTemplateId, rtSection)
              }
            }
          } else {
            if (index < slibings.length - 1) {
              rtSection = slibings[index + 1]
            } else if (rtSection.parent_section_id) {
              while (index === slibings.length - 1) {
                if (!rtSection.parent_section_id) {
                  break
                }
                rtSection = this.$store.getters.loadedSection(this.formTemplateId, rtSection.parent_section_id)
                slibings = _.sortBy(this.$store.getters.loadedChildrenSection(this.formTemplateId, rtSection.parent_section_id), element => {
                  return element.order
                })
                index = slibings.findIndex(section => {
                  return section.id === rtSection.id
                })
              }
              if (rtSection.parent_section_id || index !== slibings.length - 1) {
                rtSection = slibings[index + 1]
              } else {
                rtSection = this.list[this.list.length - 1]
                rtSection = this.getLastChildSection(this.formTemplateId, rtSection)
              }
            }
            if (!this.isSectionTrigger(rtSection)) {
              rtSection = this.getFirstChildSection(this.formTemplateId, rtSection)
            }
          }
        } while (this.isSectionTrigger(rtSection) && this.formId !== -1)
        scroll(0, 0)
        this.$store.dispatch('selectSection', rtSection)
      }
    }
  }
</script>