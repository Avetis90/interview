<template>
  <v-dialog width="600px" v-model="createQuestion">
    <div slot="activator">
      Create Question
    </div>

    <v-card>

      <!-- //Title -->
      <v-card-title>
        <div class="title mb-2 mt-2">Create Question</div>
      </v-card-title>

      <!-- //Content -->
      <v-card-text>
        <v-layout row>
          <v-flex xs12>
            <v-text-field
              name="name"
              label="Name"
              id="name"
              v-model="editedName"
              :rules="[(value) => value.length > 0 || 'Please input name.']"
              required></v-text-field>
            <v-text-field
              name="description"
              label="Description"
              id="description"
              v-model="editedDescription"
            ></v-text-field>
            <v-text-field
              name="key"
              label="Key"
              id="key"
              v-model="editedKey"
            ></v-text-field>
            <v-autocomplete
              :items="questionTypes"
              item-text="type"
              item-value="id"
              v-model="questionType"
              label="Question Type"
              single-line
            ></v-autocomplete>
            <v-switch
              :label="`Required`"
              v-model="mandatory"
            ></v-switch>
          </v-flex>
        </v-layout>
      </v-card-text>

      <!-- //Actions -->
      <v-divider></v-divider>
      <v-card-actions>
        <v-layout row py-2>
          <v-flex xs12 class="text-xs-right">
            <v-btn flat @click="onCancel">Close</v-btn>
            <v-btn class="primary" @click="onSaveChanges" :disabled="loading" :loading="loading">Save
            </v-btn>
          </v-flex>
        </v-layout>
      </v-card-actions>
      
    </v-card>

  </v-dialog>
</template>

<script>
  export default {
    props: ['sectionId', 'formTemplateId'],
    data () {
      return {
        createQuestion: false,
        editedName: '',
        editedDescription: '',
        editedKey: '',
        questionType: 1,
        mandatory: false
      }
    },
    methods: {
      onSaveChanges () {
        if (this.editedName.trim() === '') {
          return
        }
        this.createQuestion = false
        this.$store.dispatch('createQuestion',
          {
            formTemplateId: this.formTemplateId,
            sectionId: this.sectionId,
            question: this.editedName,
            description: this.editedDescription,
            questionTypeId: this.questionType,
            mandatory: this.mandatory,
            key: this.editedKey
          })
        this.editedName = ''
        this.editedDescription = ''
        this.editedKey = ''
        this.mandatory = false
        this.questionType = 1
      },
      onCancel () {
        this.editedName = ''
        this.editedDescription = ''
        this.editedKey = ''
        this.mandatory = false
        this.questionType = 1
        this.createQuestion = false
      }
    },
    computed: {
      loading () {
        return this.$store.getters.loading
      },
      questionTypes () {
        return this.$store.getters.questionTypes.filter(e => { return e.type !== 'Content Block' })
      }
    }
  }
</script>
