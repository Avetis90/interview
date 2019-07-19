import TriggerMixin from './TriggerMixin.js'
import * as _ from 'lodash'
export default {
  mixins: [TriggerMixin],
  methods: {
    getParentSection (formTemplateId, rtSection) {
      let repeat = true
      let ptSection = rtSection

      while (repeat) {
        if (this.isSectionTrigger(ptSection)) {
          ptSection = this.$store.getters.loadedSection(formTemplateId, ptSection.parent_section_id)
        } else {
          repeat = false
        }
      }

      return ptSection
    },
    getLastChildSection (formTemplateId, rtSection) {
      let repeat = true
      let ptSection = rtSection

      while (repeat) {
        const parentId = (ptSection ? ptSection.id : null)
        let children = _.sortBy(this.$store.getters.loadedChildren(formTemplateId, parentId), element => {
          return element.order
        })
        if (children.length > 0) {
          if (children[children.length - 1].answers) {
            repeat = false
          } else {
            let index = children.length - 1
            while (index > -1) {
              if (!this.isSectionTrigger(children[index])) {
                ptSection = children[index]
                break
              }
              index--
            }
          }
        } else {
          repeat = false
        }
      }

      return ptSection
    },
    getFirstChildSection (formTemplateId, rtSection) {
      let repeat = true
      let ptSection = rtSection

      while (repeat) {
        const parentId = (ptSection ? ptSection.id : null)
        let children = _.sortBy(this.$store.getters.loadedChildren(formTemplateId, parentId), element => {
          return element.order
        })
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
          }
        } else {
          repeat = false
        }
      }

      return ptSection
    }
  }
}
