<template>
  <v-container>

    <v-layout row>
      <v-flex xs12>
        <v-text-field
          label="Description"
          @blur="updateQuestion"
          v-model="editedQuestion"
          required
        ></v-text-field>
      </v-flex>
    </v-layout>

    <v-layout row>
      <v-flex xs12>
        <quill-editor
          v-model="editedDescription"
          :options="editorOption"
          @blur="updateQuestion"
          class="mb-3"
        >
        </quill-editor>
      </v-flex>
    </v-layout>

    <triggers :formTemplateId="formTemplateId" type="Question" :question="question" :questionOptions="questionOptions" v-if="questionOptions.length > 0"></triggers>

    <v-divider></v-divider>

    <v-layout pa-3 class="card_actions">
      <v-spacer></v-spacer>
      <v-btn slot="activator" color="grey darken-2" flat icon @click="moveQuestion = true">
        <v-icon>fullscreen</v-icon>
      </v-btn>
      <v-btn color="grey darken-2" flat icon @click="duplicateQuestion">
        <v-icon>content_copy</v-icon>
      </v-btn>
      <v-btn color="grey darken-2" flat icon @click.stop="deleteQuestion = true">
        <v-icon>delete</v-icon>
      </v-btn>
    </v-layout>

    <!-- //Delete Question -->
    <DeleteConfirmDialog @delete-action="onDeleteQuestion" :visible="deleteQuestion" @close="deleteQuestion = false"></DeleteConfirmDialog>
    <!-- //Move Question -->
    <ParentSectionDialog @move-action="onMoveQuestion" :visible="moveQuestion" @close="moveQuestion = false" :formTemplateId="formTemplateId" :sectionId="question.id" flag="Question"></ParentSectionDialog>
  </v-container>
</template>

<script>
  const triggers = () => import('../../Triggers')
  export default {
    props: ['question', 'formTemplateId', 'sectionId', 'index'],
    components: {
      triggers
    },
    data () {
      return {
        editedQuestion: this.question.question || 'Content Block',
        editedDescription: this.question.description,
        deleteQuestion: false,
        moveQuestion: false,
        editorOption: {}
      }
    },
    computed: {
      questionOptions () {
        return this.$store.getters.loadedAllQuestions(this.formTemplateId).filter((question) => { return question.id !== this.question.id })
      }
    },
    methods: {
      updateQuestion () {
        this.$store.dispatch('updateQuestion', {
          formTemplateId: this.formTemplateId,
          sectionId: this.sectionId,
          id: this.question.id,
          question: this.editedQuestion,
          description: this.editedDescription
        })
      },
      duplicateQuestion () {
        this.$store.dispatch('duplicateQuestion', {
          formTemplateId: this.formTemplateId,
          sectionId: this.sectionId,
          id: this.question.id
        })
      },
      onDeleteQuestion () {
        this.$store.dispatch('deleteQuestion', {
          formTemplateId: this.formTemplateId,
          sectionId: this.sectionId,
          id: this.question.id
        })
      },
      onMoveQuestion (args) {
        this.$store.dispatch('moveQuestion', {
          formTemplateId: this.formTemplateId,
          questionId: this.question.id,
          oldParentSectionId: this.sectionId,
          parentSectionId: args[0],
          order: args[1]
        })
      }
    },
    mounted () {
      if (this.question.answers.length) {
        this.$emit('delete-answers')
      }
    }
  }
</script>

<style scoped>
  .card_actions .btn, .card_actions>* {
    margin: 0 4px;
  }
</style>
