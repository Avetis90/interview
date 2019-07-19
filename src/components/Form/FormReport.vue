<template>
  <DataTable
    title='Form Responses'
    :headers='headers'
    :items='items'
    item-key='id'
    :loading='loading'
  ></DataTable>
</template>

<script>
import ResponseMixin from './ResponseMixin'
import SectionMixin from './SectionMixin'
import { mapGetters } from 'vuex'
import sortBy from 'lodash/sortBy'
const DataTable = () => import('../DataTable/DataTable')
export default {
  name: 'FormReport',
  mixins: [
    ResponseMixin,
    SectionMixin
  ],
  props: {
    formTemplateId: {
      type: Number,
      required: true
    },
    formId: {
      type: Number,
      required: true
    }
  },
  components: {
    DataTable
  },
  data () {
    return {
      loading: false
    }
  },
  computed: {
    ...mapGetters([
      'formById',
      'sectionsByFormTemplateId'
    ]),
    form () {
      return this.formById(this.formId)
    },
    sections () {
      return this.orderSections(this.sectionsByFormTemplateId(this.formTemplateId))
    },
    headers () {
      return [
        { text: 'ID', value: 'id', visible: false },
        { text: 'Order', value: 'order' },
        { text: 'Section ID', value: 'section_id', visible: false },
        { text: 'Section Order', value: 'section_order', visible: false },
        { text: 'Section', value: 'section' },
        { text: 'Question ID', value: 'question_id', visible: false },
        { text: 'Question Order', value: 'question_order', visible: false },
        { text: 'Question', value: 'question' },
        { text: 'Response', value: 'response' }
      ]
    },
    items () {
      let items = []
      this.sections.forEach(section => {
        sortBy(section.questions, ['order']).forEach(question => {
          let item = {}
          item.id = question.id
          item.section_id = section.id
          item.section = this.getSectionName(section.id, this.sections)
          item.section_order = section.order
          item.question_id = question.id
          item.question_order = question.order
          item.question = question.question
          item.response = this.form.responses ? this.formatResponse(question, this.form.responses) : ''
          if (question.question_type !== 'Content Block' && item.response.length) {
            items.push(item)
          }
        })
      })

      const orderedItems = items.map((item, index) => {
        item.order = index + 1
        return item
      })

      return orderedItems
    }
  }
}
</script>
