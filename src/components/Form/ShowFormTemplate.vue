<template>
  <v-layout row wrap v-if='formTemplate'>
    <v-flex d-flex xs12>
      <v-layout row wrap>
        <v-flex d-flex xs12>
          <h1 class="headline primary--text py-3">Edit Form Template</h1>
          <v-spacer></v-spacer>
          <div class="text-xs-right">
            <v-switch
                    :label="switchStatus.toString()"
                    :input-value="switchStatus"
                    true-value="Published"
                    false-value="Draft"
                    class="d-inline-block switchButton"
                    @change="updateStatus"
            ></v-switch>
            <v-btn icon @click="showCustomSlot = !showCustomSlot" v-if="userIsApplicationAdmin">
              <v-icon>edit</v-icon>
            </v-btn>
          </div>
        </v-flex>

        <v-flex>
          <CustomSlot :type="'formTemplateHeader' + id" :mode="showCustomSlot" />
        </v-flex>

        <!-- //Form Template Layout -->
        <v-flex xs12>
          <v-card>

            <!-- //Header -->
            <v-card-title class="info white--text">
              <v-layout row wrap>
                <v-flex d-flex xs12>
                  <div class="title pt-3">{{ formTemplate.name }}</div>
                  <v-spacer></v-spacer>

                  <!-- //Menu -->
                  <div class="text-xs-right">

                    <v-menu offset-y left>
                      <v-btn icon slot="activator">
                        <v-icon class="white--text">more_vert</v-icon>
                      </v-btn>

                      <v-list>

                        <v-list-tile @click="">
                          <v-list-tile-avatar>
                            <v-icon>create_new_folder</v-icon>
                          </v-list-tile-avatar>
                          <v-list-tile-content>
                            <CreateSection :parentSectionId="-1" :formTemplateId="id"></CreateSection>
                          </v-list-tile-content>
                        </v-list-tile>

                        <v-list-tile @click="">
                          <v-list-tile-avatar>
                            <v-icon>edit</v-icon>
                          </v-list-tile-avatar>
                          <v-list-tile-content>
                            <EditFormTemplate :formTemplate="formTemplate" :slug="slug"></EditFormTemplate>
                          </v-list-tile-content>
                        </v-list-tile>

                        <v-list-tile @click="onPublishFormTemplate('Closed')" v-if="status === 'Open'">
                          <v-list-tile-avatar>
                            <v-icon>send</v-icon>
                          </v-list-tile-avatar>
                          <v-list-tile-content>
                            Publish Form Template
                          </v-list-tile-content>
                        </v-list-tile>

                        <v-list-tile @click="onPublishFormTemplate('Open')" v-if="status === 'Closed'">
                          <v-list-tile-avatar>
                            <v-icon>send</v-icon>
                          </v-list-tile-avatar>
                          <v-list-tile-content>
                            Draft Form Template
                          </v-list-tile-content>
                        </v-list-tile>

                        <v-list-tile @click.stop="deleteFormTemplate = true">
                          <v-list-tile-avatar>
                            <v-icon>delete</v-icon>
                          </v-list-tile-avatar>
                          <v-list-tile-content>
                            Delete Form Template
                          </v-list-tile-content>
                        </v-list-tile>

                        <v-divider></v-divider>
                        <v-list-tile>
                          <v-list-tile-avatar>
                            <v-icon>cloud_upload</v-icon>
                          </v-list-tile-avatar>
                          <v-list-tile-content>
                            <UploadFormTemplate :formTemplate="formTemplate" :slug="slug"></UploadFormTemplate>
                          </v-list-tile-content>
                        </v-list-tile>

                        <v-list-tile>
                          <v-list-tile-avatar>
                            <v-icon>cloud_upload</v-icon>
                          </v-list-tile-avatar>
                          <v-list-tile-content>
                            <UploadFormData :formTemplate="formTemplate" :slug="slug"></UploadFormData>
                          </v-list-tile-content>
                        </v-list-tile>

                        <v-list-tile @click="">
                          <v-list-tile-avatar>
                            <v-icon>cloud_download</v-icon>
                          </v-list-tile-avatar>
                          <v-list-tile-content>
                            <download-excel
                              :data="sections"
                              :name="fileName + '.csv'"
                              type="csv"
                            >
                              Export
                            </download-excel>
                          </v-list-tile-content>
                        </v-list-tile>

                      </v-list>
                    </v-menu>
                  </div>
                </v-flex>
              </v-layout>
            </v-card-title>
            <v-divider></v-divider>

            <v-card-text>
              <v-layout row wrap>

                <v-flex d-flex xs12>
                  <form-view
                    :slug="slug"
                    :formTemplateId="id"
                    :formId="-1"
                  ></form-view>
                </v-flex>

              </v-layout>
            </v-card-text>

            <!-- //Footer -->
            <v-divider></v-divider>
            <v-card-actions>

              <formNavigation
                :slug="slug"
                :formTemplateId="id"
                :formId="-1"
              ></formNavigation>

            </v-card-actions>

          </v-card>
        </v-flex>

        <v-flex>
          <CustomSlot :type="'formTemplateFooter' + id" :mode="showCustomSlot" />
        </v-flex>

      </v-layout>
    </v-flex>

    <!-- //Delete Form Template -->
    <DeleteConfirmDialog @delete-action="onDeleteFormTemplate" :visible="deleteFormTemplate" @close="deleteFormTemplate = false"></DeleteConfirmDialog>
  </v-layout>
</template>

<script>
  import * as _ from 'lodash'
  import moment from 'moment'
  import UserMixin from '../Layout/UserMixin'
  const FormView = () => import('./FormView')
  const EditFormTemplate = () => import('./EditFormTemplate')
  const UploadFormTemplate = () => import('./UploadFormTemplate')
  const UploadFormData = () => import('./UploadFormData')
  const CreateSection = () => import('./Section/CreateSection')
  const FormNavigation = () => import('./FormNavigation')
  const CustomSlot = () => import('../Layout/CustomSlot')
  export default {
    props: ['id'],
    mixins: [UserMixin],
    components: {
      FormView,
      EditFormTemplate,
      UploadFormTemplate,
      UploadFormData,
      CreateSection,
      FormNavigation,
      CustomSlot
    },
    data () {
      return {
        deleteFormTemplate: false,
        slug: window.location.hostname.split('.')[0],
        showCustomSlot: false
      }
    },
    computed: {
      switchStatus () {
        if (!this.formTemplate) {
          return ''
        }
        return this.status === 'Open' ? 'Draft' : 'Published'
      },
      questionTypes () {
        return this.$store.getters.questionTypes
      },
      status () {
        if (!this.formTemplate) {
          return 'undefined'
        }
        const status = this.statuses.find((status) => {
          return status.id === this.formTemplate.status_id
        })
        return status ? status.status : 'undefined'
      },
      statuses () {
        return this.$store.getters.statuses
      },
      formTemplate () {
        return this.$store.getters.loadedFormTemplate(this.slug, parseInt(this.id))
      },
      sections () {
        // section_id, section_name, section_order, question_id, question, answer_id, answer
        const data = []
        const sections = _.sortBy(this.formTemplate.sections, element => {
          return element.id
        })
        sections.forEach((section) => {
          const sectionTemplate = {
            section_id: section.id,
            section_name: section.name,
            section_order: section.order
          }
          const questions = _.sortBy(section.questions, element => {
            return element.id
          })
          questions.forEach((question) => {
            const questionTemplate = Object.assign(sectionTemplate, {
              question_id: question.id,
              question: question.question,
              question_type: this.getQuestionType(question.question_type_id)
            })
            const answers = _.sortBy(question.answers, element => {
              return element.id
            })
            answers.forEach((answer) => {
              const answerTemplate = Object.assign(questionTemplate, {
                answer_id: answer.id,
                answer: answer.answer
              })
              data.push(Object.assign({}, answerTemplate))
            })
          })
        })
        return data
      },
      fileName () {
        return 'Form Template ' + this.formTemplate.name + ' ' + moment().format('YYYY-MM-DD [at] LTS')
      }
    },
    methods: {
      getQuestionType (questionTypeId) {
        const questionType = this.questionTypes.find((questionType) => {
          return questionType.id === questionTypeId
        })
        return questionType ? questionType.type : 'undefined'
      },
      onDeleteFormTemplate () {
        this.$store.dispatch('deleteFormTemplate', {
          slug: this.slug,
          id: this.formTemplate.id
        })
        this.$router.push('/form-templates')
      },
      onPublishFormTemplate (value) {
        const status = this.statuses.find((status) => {
          return status.status === value
        })
        this.$store.dispatch('updateFormTemplate', {
          slug: this.slug,
          id: this.id,
          statusId: status.id
        })
      },
      updateStatus () {
        const newStatus = (this.status === 'Open') ? 'Closed' : 'Open'
        const status = this.statuses.find((status) => {
          return status.status === newStatus
        })
        this.$store.dispatch('updateFormTemplate', {
          slug: this.slug,
          id: this.id,
          statusId: status.id
        })
      }
    },
    created: function () {
      this.$store.dispatch('loadFormTemplates', this.slug)
      this.$store.dispatch('loadSections', this.id)
      this.$store.dispatch('loadValidations', this.id)
      this.$store.dispatch('loadTriggers', this.id)
      this.$store.dispatch('selectSection', null)
    }
  }
</script>

<style>
  .switchButton label {
    width: 70px;
  }
</style>