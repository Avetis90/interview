import sortBy from 'lodash/sortBy'
import remove from 'lodash/remove'
export default {
  name: 'SectionMixin',
  methods: {
    getSectionName (id, sections) {
      let names = []
      do {
        const section = sections.find(s => s.id === id)
        names.push(section.name)
        id = section.parent_section_id
      } while (id)
      return names.reverse().join(' > ')
    },
    orderSections (sections) {
      let loop = 0
      let orderedSections = sortBy(remove(sections, s => !s.parent_section_id), ['order'])
      do {
        orderedSections.forEach(parent => {
          const children = sortBy(remove(sections, s => s.parent_section_id === parent.id), ['order'])
          if (children.length) {
            orderedSections.splice(orderedSections.findIndex(s => s.id === parent.id) + 1, 0, children)
          }
        })
        loop++
      } while (sections.length || loop > 100)
      return [].concat(...orderedSections)
    }
  }
}
