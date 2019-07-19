<template>
  <v-card flat active-class="active-section" v-if="!isSectionTrigger(section) || formId === -1">

    <v-card-title>
      <v-flex>
        <div class="section-name">
          <template v-if="editMode">
            <v-text-field
              label="Section Name"
              v-model="editedName"
              @blur="checkNameUpdate"
            ></v-text-field>
          </template>

          <template v-else-if="sections.length > 1">
            <div class="title px-3" @click="setEditMode">{{ editedName }}</div>
          </template>
        </div>
      </v-flex>

      <v-flex style="min-width: 130px; max-width: 130px;" v-if="formId === -1">
        <v-switch
          label="Repeatable"
          v-model="hasRepeatableQuestions"
          @change="changeRepeatable($event)"
        ></v-switch>
      </v-flex>

      <v-menu offset-y bottom left v-if="formId === -1">
        <v-btn icon slot="activator">
          <v-icon>more_vert</v-icon>
        </v-btn>

        <v-list>
          <v-list-tile @click="" v-if="!includeQuestion && !hasRepeatableQuestions">
            <v-list-tile-avatar>
              <v-icon>create_new_folder</v-icon>
            </v-list-tile-avatar>
            <v-list-tile-content>
              <CreateSection :parentSectionId="section.id" :formTemplateId="formTemplateId"></CreateSection>
            </v-list-tile-content>
          </v-list-tile>

          <v-list-tile @click.stop="deleteSection = true">
            <v-list-tile-avatar>
              <v-icon>delete</v-icon>
            </v-list-tile-avatar>
            <v-list-tile-content>Delete Section</v-list-tile-content>
          </v-list-tile>

          <v-list-tile @click="" v-if="!includeSection">
            <v-list-tile-avatar>
              <v-icon>add</v-icon>
            </v-list-tile-avatar>
            <v-list-tile-content>
              <CreateQuestion :sectionId="section.id" :formTemplateId="formTemplateId"></CreateQuestion>
            </v-list-tile-content>
          </v-list-tile>

          <v-list-tile @click.stop="moveSection = true">
            <v-list-tile-avatar>
              <v-icon>fullscreen</v-icon>
            </v-list-tile-avatar>
            <v-list-tile-content>Move Section</v-list-tile-content>
          </v-list-tile>

          <v-list-tile @click="createContentBlock" v-if="!includeSection">
            <v-list-tile-avatar>
              <v-icon>add_comment</v-icon>
            </v-list-tile-avatar>
            <v-list-tile-content>Create Content Block</v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-menu>
    </v-card-title>

    <v-card-text v-show="expanded">
      <v-layout row wrap justify-space-around v-if="hasRepeatableQuestions && formId === -1">
        <v-flex xs5 style="min-width: 130px">
          <v-text-field
            label="Minimum rows count"
            @change="updateRowsCount"
            v-model="min_rows"
            :rules="[validateMinRows]">
          </v-text-field>
        </v-flex>

        <v-flex xs5 style="min-width: 130px">
          <v-text-field
            label="Maximum rows count"
            @change="updateRowsCount"
            v-model="max_rows"
            :rules="[validateMaxRows]">
          </v-text-field>
        </v-flex>
      </v-layout>

      <triggers :formTemplateId="formTemplateId" :question="section" :questionOptions="questionOptions" type="Section" v-if="questionOptions.length > 0 && formId === -1"></triggers>
      
      <!-- //Form Template -->
      <template v-if="formId == -1">
        <v-flex xs12>

          <v-expansion-panel popout>
            <draggable
              v-model="list"
              :class="'section' + section.id"
              :options="{group: 'parent', draggable: '.v-expansion-panel__container', handle: '.item'}"
              @end="checkEnd"
              class="layout row wrap">
              <v-expansion-panel-content
                v-for="(element,index) in list"
                :key="index"
                :class="getQuestionClass(element)"
              >
                <div slot="header">
                  <h3>
                    <v-icon class="item">drag_handle</v-icon>
                    {{index + 1 }}. {{ element.question || element.name }}
                    <v-icon class="question_icon">{{ getQuestionIcon(element) }}</v-icon>
                  </h3>
                </div>
                <v-card>
                  <v-card-text>

                    <v-flex
                      xs12
                      :class="'element' + element.id">
                      <sections
                        :section="element"
                        :formTemplateId="formTemplateId"
                        :formId="formId"
                        :key="'section' + element.id"
                        v-if="element.questions"
                      ></sections>

                      <questions
                        :question="element"
                        :formTemplateId="formTemplateId"
                        :sectionId="section.id"
                        :index="index + 1"
                        :key="'question' + element.id"
                        v-if="element.answers && getQuestionType(element.question_type_id) !== 'Content Block'"
                      ></questions>

                      <QuestionContentBlock
                        :question="element"
                        :formTemplateId="formTemplateId"
                        :sectionId="section.id"
                        :index="index + 1"
                        :key="'question' + element.id"
                        v-if="element.answers && getQuestionType(element.question_type_id) === 'Content Block'"
                      ></QuestionContentBlock>
                    </v-flex>

                  </v-card-text>
                </v-card> 
              </v-expansion-panel-content>
            </draggable>
          </v-expansion-panel>

        </v-flex>
      </template>

      <!-- //Form Template -->
      <template v-else>

        <!-- //Standard -->
        <v-layout row wrap v-if="!hasRepeatableQuestions">
          <template v-for="(element, index) in list" v-if="!isTrigger(element , 1)">
            <responses
              :question="element"
              :formTemplateId="formTemplateId"
              :sectionId="section.id"
              :index="index + 1"
              :formId="formId"
              :key="'question' + element.id"
              :order="1"
              :status="status"
              v-if="getQuestionType(element.question_type_id) !== 'Content Block'"
            ></responses>

            <ResponseContentBlock
              :question="element"
              :key="'question' + element.id"
              v-if="getQuestionType(element.question_type_id) === 'Content Block'"
            ></ResponseContentBlock>
          </template>
        </v-layout>

        <!-- //Repeatable -->
        <template v-else>
          <v-layout
            row
            wrap
            v-for="order in sectionRepeatableCount"
            :key="'repeat' + order"
          >

            <template v-for="(element, index) in list"  v-if="!isTrigger(element, order)">
              <responses
                :question="element"
                :formTemplateId="formTemplateId"
                :sectionId="section.id"
                :index="index + 1"
                :formId="formId"
                :order="order"
                :hide="list.length === 1 && order > 1"
                :key="'question' + element.id + '-' + order"
                :status="status"
                v-if="getQuestionType(element.question_type_id) !== 'Content Block'"
              ></responses>

              <ResponseContentBlock
                :question="element"
                :key="'question' + element.id + '-' + order"
                v-if="getQuestionType(element.question_type_id) === 'Content Block'"
              ></ResponseContentBlock>
            </template>

            <template v-if='sectionRepeatableCount > section.min_rows'>
              <v-flex xs12 sm1 offset-sm11 text-xs-center>
                <v-btn dark fab small color="error" @click="removeSection(order)" :disabled="status === 'Closed'">
                  <v-icon>close</v-icon>
                </v-btn>
              </v-flex>
            </template>

          </v-layout>

          <v-layout wrap v-if='formId !== -1 && hasRepeatableQuestions && (sectionRepeatableCount < section.max_rows || !section.max_rows)'>
            <v-btn dark block color="primary" @click="addSection" :disabled="status === 'Closed'">
              <v-icon dark>add</v-icon>
              Add {{section.name}}
            </v-btn>
          </v-layout>
        </template>

      </template>

    </v-card-text>

    <!-- //Delete Section -->
    <DeleteConfirmDialog @delete-action="onDeleteSection" :visible="deleteSection" @close="deleteSection = false"></DeleteConfirmDialog>

    <!-- //Move Section -->
    <ParentSectionDialog @move-action="onMoveSection" :visible="moveSection" @close="moveSection = false" :formTemplateId="formTemplateId" :sectionId="section.id" flag="Section"></ParentSectionDialog>

    <!-- //Show snackbar -->
    <Snackbar content="Progress saved" :snackbar="snackbarVisible" @dismissed="snackbarVisible = false"></Snackbar>
  </v-card>
</template>

<script>
  import draggable from 'vuedraggable'
  import * as _ from 'lodash'
  import TriggerMixin from '../TriggerMixin.js'
  import triggers from '../Triggers'
  const questions = () => import('../Question/Questions')
  const responses = () => import('../Response/Responses')
  const QuestionContentBlock = () => import('../Question/components/ContentBlock')
  const ResponseContentBlock = () => import('../Response/components/ContentBlock')
  const CreateSection = () => import('./CreateSection')
  const CreateQuestion = () => import('../Question/CreateQuestion')
  export default {
    name: 'sections',
    props: ['section', 'formTemplateId', 'formId'],
    mixins: [TriggerMixin],
    components: {
      draggable,
      questions,
      responses,
      CreateSection,
      CreateQuestion,
      QuestionContentBlock,
      ResponseContentBlock,
      triggers
    },
    data () {
      return {
        editedName: this.section.name,
        expanded: true,
        editMode: false,
        hasRepeatableQuestions: this.section.repeatable,
        min_rows: this.section.min_rows,
        max_rows: this.section.max_rows,
        deleteSection: false,
        moveSection: false,
        snackbarVisible: false,
        sectionRepeatableCount: 1
      }
    },
    mounted () {
      if (this.section.repeatable && this.responses.length) {
        this.sectionRepeatableCount = this.responses[this.responses.length - 1].order
      }
    },
    watch: {
      section (value) {
        this.editedName = value.name
        this.hasRepeatableQuestions = value.repeatable
        this.min_rows = value.min_rows
        this.max_rows = value.max_rows
      }
    },
    computed: {
      sections () {
        return this.$store.getters.loadedSections(this.formTemplateId)
      },
      form () {
        if (this.formId <= 0) {
          return null
        }
        return this.$store.getters.loadedForm(parseInt(this.formTemplateId), parseInt(this.formId))
      },
      statuses () {
        return this.$store.getters.statuses
      },
      status () {
        if (!this.form) {
          return null
        }
        return this.getStatus(this.form.status_id)
      },
      list: {
        get () {
          return _.sortBy(this.$store.getters.loadedChildren(this.formTemplateId, this.section.id), element => {
            return element.order
          })
        },
        set (value) {
          // TODO: Drggable components
        }
      },
      isSectionEmpty () {
        return !this.list.length
      },
      responses () {
        if (this.formId <= 0) {
          return []
        }
        let responses = this.form.responses.filter((response) => {
          const questions = this.section.questions.filter((question) => {
            return question.id === response.question_id
          })
          return questions.length
        })

        return _.sortBy(responses, element => {
          return element.order
        })
      },
      includeSection () {
        if (!this.list.length) {
          return false
        }
        return !!this.list[0].questions
      },
      includeQuestion () {
        if (!this.list.length) {
          return false
        }
        return !!this.list[0].answers
      },
      questionOptions () {
        const allQuestions = this.$store.getters.loadedAllQuestions(this.formTemplateId)
        // return _.sortBy(allQuestions, element => {
        //   return element.id
        // })
        return allQuestions
      }
    },
    methods: {
      getQuestionClass (element) {
        return 'element' + element.id + ' ' + this.getQuestionType(element.question_type_id).replace(' ', '-').toLowerCase()
      },
      getQuestionIcon (element) {
        let questionType = this.getQuestionType(element.question_type_id)
        switch (questionType) {
          case 'Content Block': return 'code'
        }
      },
      getStatus (statusId) {
        const status = this.statuses.find((status) => {
          return status.id === statusId
        })
        return status ? status.status : 'undefined'
      },
      addSection () {
        this.sectionRepeatableCount += 1
      },
      removeSection (order) {
        if (this.sectionRepeatableCount === 1) {
          return
        }
        this.sectionRepeatableCount -= 1
        this.deleteSectionResponse(order)
      },
      changeRepeatable (value) {
        this.updateSection()
      },
      createQuestion (args) {
        const qustionName = args[0]
        const questionDescription = args[1]
        const questionType = args[2]
        const mandatory = args[3]

        this.$store.dispatch('createQuestion', {
          formTemplateId: this.formTemplateId,
          sectionId: this.section.id,
          question: qustionName,
          description: questionDescription,
          questionTypeId: questionType,
          mandatory: mandatory
        })
      },
      createContentBlock () {
        const questionType = this.questionTypes.find((questionType) => {
          return questionType.type === 'Content Block'
        })
        this.$store.dispatch('createQuestion', {
          formTemplateId: this.formTemplateId,
          sectionId: this.section.id,
          question: 'Content Block',
          description: '',
          questionTypeId: questionType.id,
          mandatory: false
        })
      },
      deleteQuestion (id) {
        this.$store.dispatch('deleteQuestion', {
          formTemplateId: this.formTemplateId,
          sectionId: this.section.id,
          id: id
        })
      },
      updateQuestion (args) {
        const index = args[0]
        const value = args[1]
        this.$store.dispatch('updateQuestion', {
          formTemplateId: this.formTemplateId,
          sectionId: this.section.id,
          id: index,
          question: value
        })
      },
      createAnswer (args) {
        const questionId = args[0]
        const answer = args[1]
        this.$store.dispatch('createAnswer', {
          formTemplateId: this.formTemplateId,
          sectionId: this.section.id,
          questionId: questionId,
          answer: answer,
          parameter: true
        })
      },
      deleteAnswer (args) {
        const questionId = args[0]
        const index = args[1]
        this.$store.dispatch('deleteAnswer', {
          formTemplateId: this.formTemplateId,
          sectionId: this.section.id,
          questionId: questionId,
          id: index
        })
      },
      updateAnswer (args) {
        const questionId = args[0]
        const index = args[1]
        const answer = args[2]
        this.$store.dispatch('updateAnswer', {
          formTemplateId: this.formTemplateId,
          sectionId: this.section.id,
          questionId: questionId,
          id: index,
          answer: answer
        })
      },
      createResponse (args) {
        if (this.formId <= 0) {
          return
        }
        const answerId = args[0]
        const response = args[1]
        const questionId = args[2]
        const order = args[3]
        this.$store.dispatch('createResponse', {
          formId: parseInt(this.formId),
          questionId: questionId,
          formTemplateId: this.formTemplateId,
          answerId: answerId,
          response: response,
          order: order
        }).then((response) => {
          this.updateForm()
        })
      },
      updateResponse (args) {
        const answerId = args[0]
        const response = args[1]
        const id = args[2]
        const questionId = args[3]
        const order = args[4]
        this.$store.dispatch('updateResponse', {
          formId: parseInt(this.formId),
          questionId: questionId,
          formTemplateId: this.formTemplateId,
          answerId: answerId,
          response: response,
          id: id,
          order: order
        }).then((response) => {
          this.updateForm()
        })
      },
      deleteResponse (args) {
        this.$store.dispatch('deleteResponse', {
          formId: parseInt(this.formId),
          questionId: args[1],
          formTemplateId: this.formTemplateId,
          id: args[0]
        }).then((response) => {
          this.updateForm()
        })
      },
      deleteSectionResponse (order) {
        this.$store.dispatch('deleteSectionResponse', {
          formId: parseInt(this.formId),
          formTemplateId: this.formTemplateId,
          sectionId: this.section.id,
          order: order
        }).then((response) => {
          this.updateForm()
        })
      },
      updateForm () {
        this.$store.dispatch('updateForm', {
          id: parseInt(this.formId),
          formTemplateId: this.formTemplateId,
          progress: this.progress(parseInt(this.formTemplateId), parseInt(this.formId))
        })
        this.snackbarVisible = true
      },
      setEditMode () {
        if (this.formId === -1) {
          this.editMode = true
        }
      },
      toggleExpand () {
        this.expanded = !this.expanded
      },
      updateSection () {
        if (this.editedName.trim() === '') {
          return
        }
        this.$store.dispatch('updateSection',
          {
            formTemplateId: this.formTemplateId,
            id: this.section.id,
            parentSectionId: this.section.parentSectionId,
            name: this.editedName,
            repeatable: this.hasRepeatableQuestions,
            min_rows: this.min_rows,
            max_rows: this.max_rows
          })
      },
      onMoveSection (args) {
        this.$store.dispatch('moveSection', {
          formTemplateId: this.formTemplateId,
          sectionId: this.section.id,
          parentSectionId: args[0],
          order: args[1]
        })
      },
      onDeleteSection () {
        this.$store.dispatch('deleteSection', {
          formTemplateId: this.formTemplateId,
          id: this.section.id
        })
      },
      checkNameUpdate () {
        if (this.editedName !== this.section.name) {
          this.updateSection()
        }
        this.editMode = false
      },
      moveAnswer (args) {
        const questionId = args[0]
        const id = args[1]
        const order = args[2]
        this.$store.dispatch('moveAnswer', {
          formTemplateId: this.formTemplateId,
          sectionId: this.section.id,
          questionId: questionId,
          id: id,
          order: order
        })
      },
      moveQuestion (args) {
        const id = args[0]
        const order = args[1]
        this.$store.dispatch('moveQuestion',
          {
            formTemplateId: this.formTemplateId,
            questionId: id,
            oldParentSectionId: this.section.id,
            parentSectionId: this.section.id,
            order: order
          })
      },
      checkEnd: function (evt) {
        if (evt.to.className === evt.from.className && evt.newIndex === evt.oldIndex) {
          return
        }
        if (evt.item.className.includes('question') && evt.to.className.includes('parent')) {
          return
        }

        // What is the purpose of this? Blocks moving question in most cases
        // if (evt.item.className.length > 40) {
        //  return
        // }

        let newIndex = evt.newIndex

        if (evt.to.className === evt.from.className && evt.newIndex > evt.oldIndex) {
          newIndex = newIndex + 1
        }

        const elementClass = evt.item.className
        const parentClass = evt.to.className
        const parentSectionId = parseInt(parentClass.substr(23))

        const children = _.sortBy(this.$store.getters.loadedChildren(this.formTemplateId, parentSectionId), element => {
          return element.order
        })

        let order = 1
        if (children.length === newIndex) {
          order = children[newIndex - 1].order + 1
        } else {
          order = children[newIndex].order
        }

        const oldparentClass = evt.from.className
        const oldParentSectionId = parseInt(oldparentClass.substr(23))
        const elementId = parseInt(elementClass.substr(36))
        this.$store.dispatch('moveQuestion',
          {
            formTemplateId: this.formTemplateId,
            questionId: elementId,
            oldParentSectionId: oldParentSectionId,
            parentSectionId: parentSectionId,
            order: order
          })
      },
      validateMinRows (value) {
        this.min_rows = parseInt(value)
        if (isNaN(this.min_rows)) {
          this.min_rows = ''
          return 'Minimum rows count is required.'
        }
        if (this.max_rows && this.min_rows > this.max_rows) {
          return 'Minimum rows count is set bigger than maximum rows count.'
        } else {
          return true
        }
      },
      validateMaxRows (value) {
        this.max_rows = parseInt(value)
        if (isNaN(this.max_rows)) {
          this.max_rows = ''
        }
        if (this.max_rows && this.min_rows > this.max_rows) {
          return 'Maximum rows count is set smaller than minimum rows count.'
        } else {
          return true
        }
      },
      updateRowsCount () {
        if (this.validateMinRows(this.min_rows) === true && this.validateMaxRows(this.max_rows) === true) {
          this.updateSection()
        }
      }
    }
  }
</script>

<style scoped>
  .title {
    word-break: break-word;
  }
  .v-card__title {
    flex-wrap: unset !important;
  }
  .v-expansion-panel__header div:first-child {
    display: -webkit-box;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
  }
  .v-expansion-panel__container.content-block {
    background: khaki;
  }
  .v-icon.question_icon {
    float:right;
    padding-right: 20px;
    padding-left:20px;
  }
</style>
