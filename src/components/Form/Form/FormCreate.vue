<template>
  <v-dialog 
    :value="value"
    @input="close()"
    width="600">
    <v-card>
      <v-toolbar
        flat
        dark
        color="primary">
        <v-toolbar-title>Create Form</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <v-form
          ref="form"
          lazy-validation
          autocomplete="off"
        >
          <v-flex>
            <v-autocomplete
              :items="sortedFormTemplates"
              item-value="id"
              item-text="name"
              v-model="form.form_template_id"
              label="Form Template"
              :rules='rules.form_template'
              @change='setForm'
              autocomplete="no"
            ></v-autocomplete>
          </v-flex>
          <v-flex xs12 v-if="showUsers">
            <v-autocomplete
              :items="sortedUsers"
              item-value="id"
              item-text="full_name"
              v-model="form.user_id"
              label="User"
              :rules='rules.user'
              autocomplete="no"
            ></v-autocomplete>
          </v-flex>
          <v-flex xs12 v-if="showOrganisations">
            <div class="body-2">This form template requires an organisation.</div>
            <v-combobox
              :items="sortedOrganisations"
              v-model="form.organisation"
              persistent-hint
              hint="Select your organisation or create a new organisation"
              label="Organisation"
              :rules='rules.organisation'
              autocomplete="no"
            ></v-combobox>
          </v-flex>
          </v-form>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
          <v-btn flat @click.stop="close()">Cancel</v-btn>
          <v-btn color="primary" @click.stop="validate()">Create Form</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  
</template>

<script>
  import sortBy from 'lodash/sortBy'
  import get from 'lodash/get'
  import { isPermissible } from './../../../util/acl'
  import { mapGetters } from 'vuex'
  export default {
    name: 'FormCreate',
    props: {
      value: {
        type: Boolean,
        default: false,
        required: true
      },
      slug: {
        type: String,
        requried: true
      }
    },
    data () {
      return {
        form: {},
        rules: {
          form_template: [
            v => !!v || 'Form template is required'
          ],
          user: [
            v => !!v || 'User is required'
          ],
          organisation: [
            v => !!v || 'Organiastion is required'
          ]
        }
      }
    },
    computed: {
      ...mapGetters([
        'formTemplates',
        'users',
        'organisations',
        'types',
        'user',
        'userIsSuperAdmin',
        'userIsAdmin',
        'statusById',
        'userAcl'
      ]),
      isAdmin () {
        return this.userIsSuperAdmin || this.userIsAdmin(this.$_slug, this.user.id)
      },
      sortedFormTemplates () {
        let formTemplates = this.formTemplates(this.$_slug)
        if (!this.isAdmin) {
          formTemplates = formTemplates.filter(ft => {
            return isPermissible(this.userAcl.show, 'form_templates', ft) && get(this.statusById(ft.status_id), 'status') === 'Closed'
          })
        }
        return sortBy(formTemplates, ['name'])
      },
      formTemplate () {
        return this.sortedFormTemplates.find(ft => ft.id === this.form.form_template_id)
      },
      sortedOrganisations () {
        return this.organisations(this.$_slug).map(o => o.name).sort()
      },
      sortedUsers () {
        return sortBy(this.users(this.$_slug).map(u => {
          u.full_name = u.first_name + ' ' + u.last_name + ' (' + u.email + ')'
          return u
        }), ['first_name', 'last_name'])
      },
      showOrganisations () {
        return this.formTemplate && get(this.types.find(t => t.id === this.formTemplate.type_id), 'name') === 'organisation'
      },
      showUsers () {
        return this.isAdmin && this.formTemplate && !this.showOrganisations
      }
    },
    methods: {
      save () {
        this.$store.dispatch('createForm', this.form)
        .then(response => {
          this.close()
          this.$router.push('/forms/' + response.data.form.id)
        })
      },
      validate () {
        if (this.$refs.form.validate()) {
          this.save()
        }
      },
      close () {
        this.form = {}
        this.$emit('input')
        this.$refs.form.resetValidation()
      },
      setForm () {
        const form = {
          form_template_id: this.form.form_template_id
        }
        this.form = form
      },
      loadData () {
        Promise.all([
          this.$store.dispatch('loadUserAcl'),
          this.$store.dispatch('loadOrganisations', this.$_slug),
          this.$store.dispatch('loadFormTemplates', this.$_slug),
          this.$store.dispatch('loadStatuses'),
          this.$store.dispatch('loadTypes')
        ])
        .then(() => {
          if (this.isAdmin) {
            this.$store.dispatch('loadUsers', this.$_slug)
          }
        })
      }
    },
    created () {
      this.loadData()
    }
  }
</script>
