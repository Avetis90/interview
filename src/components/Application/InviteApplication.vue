<template>
  <v-dialog v-model="show" fullscreen hide-overlay lazy>
    <v-card>

      <v-toolbar dark color="primary">
        <v-btn icon dark @click.stop="show = false">
          <v-icon>close</v-icon>
        </v-btn>
        <v-toolbar-title>Invite Users</v-toolbar-title>
      </v-toolbar>

      <v-form
        ref="form"
        v-model="valid"
        lazy-validation
        autocomplete="off"
      >

        <!-- // Users -->
        <v-container fluid>
          <div class="title my-2">Users</div>
          <template v-for="(item, index) in invitations">
            <v-layout row wrap v-bind:key="index">

              <v-flex xs12 md11>
                <v-layout>

                  <!-- // Firstname -->
                  <v-flex xs12 md4 pr-4>
                    <v-text-field
                      label="First Name"
                      v-model="item.firstname"
                      :rules="rules.firstname"
                      required
                      autocomplete="no"
                    ></v-text-field>
                  </v-flex>

                  <!-- // Lastname -->
                  <v-flex xs12 md4 pr-4>
                    <v-text-field
                      label="Last Name"
                      v-model="item.lastname"
                      :rules="rules.lastname"
                      required
                      autocomplete="no"
                    ></v-text-field>
                  </v-flex>

                  <!-- // Email -->
                  <v-flex xs12 md4 pr-4>
                    <v-text-field
                      label="Email"
                      v-model="item.email"
                      :rules="rules.email"
                      required
                      autocomplete="no"
                    ></v-text-field>
                  </v-flex>

                  <!-- // Organisation -->
                  <v-flex xs12 md4>
                    <v-text-field
                      label="Organisation"
                      v-model="item.organisation"
                      required
                      autocomplete="no"
                    ></v-text-field>
                  </v-flex>

                </v-layout>
              </v-flex>
              <v-flex xs12 md1 text-xs-center text-sm-right>
                <v-btn flat icon @click="removeUser" class="mt-3">
                  <v-icon>close</v-icon>
                </v-btn>
              </v-flex>
            </v-layout>
          </template>

          <!-- // Add User -->
          <v-layout row>
            <v-flex xs12 class="text-xs-center">
              <v-btn flat @click.stop="addUser">Add User</v-btn>
              <v-btn flat @click.stop="bulkUpload">Upload Multiple Users</v-btn>
              <input
                type="file"
                style="display: none"
                ref="fileUpload"
                accept=".csv"
                @change="onFilePicked"
              >
            </v-flex>
          </v-layout>

        </v-container>

        <v-divider class="py-2"></v-divider>

        <v-container fluid>

          <!-- // Permissions -->
          <div class="title my-2">User Permissions</div>
          <v-layout row wrap class="mb-4">

            <!-- // Application Role -->
            <v-flex sm12 md6 pr-4>
              <v-autocomplete
                :items="this.$_applicationRoles"
                item-text="name"
                item-value="id"
                v-model="role_id"
                :rules="rules.role_id"
                label="Application Role"
                required
                autocomplete="no"
              ></v-autocomplete>
            </v-flex>

            <!-- // Form Templates -->
            <v-flex sm12 md6>
              <v-autocomplete
                :items="this.$_getApplicationPrivateFormTemplates()"
                item-text="name"
                item-value="id"
                v-model="formTemplates"
                label="Form Templates"
                required
                multiple
                autocomplete="no"
              ></v-autocomplete>
            </v-flex>

          </v-layout>

        </v-container>

        <v-divider class="py-2"></v-divider>

        <v-container fluid>

          <!-- // Invitation -->
          <div class="title my-2">Invitation Email</div>
          <v-layout row wrap class="mb-4">

            <v-flex xs12>

              <!-- // Subject -->
              <v-flex xs12>
                <v-text-field
                  label="Subject"
                  v-model="subject"
                  :rules="rules.subject"
                  required
                  autocomplete="no"
                ></v-text-field>
              </v-flex>

              <!-- // CC -->
              <v-flex xs12>
                <v-text-field
                  label="CC"
                  v-model="cc"
                  required
                  autocomplete="no"
                ></v-text-field>
              </v-flex>

              <!-- // BCC -->
              <v-flex xs12>
                <v-text-field
                  label="BCC"
                  v-model="bcc"
                  required
                  autocomplete="no"
                ></v-text-field>
              </v-flex>

              <!-- // Message -->
              <v-flex xs12>
                <quill-editor 
                  v-model="message"
                >
                </quill-editor>
                <p class="mt-2 grey--text text--darken-1 caption">
                  <strong>Available mail tags:</strong>
                  <ul>
                    <li v-pre>{{first_name}}: Display the users first name</li>
                    <li v-pre>{{last_name}}: Display the users last name</li>
                    <li v-pre>{{email}}: Display the users email</li>
                    <li v-pre>{{invite_link}}: Display the invitation link</li>
                  </ul>
                </p>
              </v-flex>

            </v-flex>

          </v-layout>

        </v-container>


        <!-- //Actions -->
        <v-divider></v-divider>
        <v-container fluid>
          <v-layout row py-2>
            <v-flex xs12 class="text-xs-right">
              <v-btn flat @click.stop="close">Cancel</v-btn>
              <v-btn color="primary" @click.stop="validate">Invite Users</v-btn>
            </v-flex>
          </v-layout>
        </v-container>

      </v-form>

    </v-card>
  </v-dialog>
</template>

<script>
  import _ from 'lodash'
  import papa from 'papaparse'
  import validator from 'validator'
  import ApplicationMixin from '../../mixins/ApplicationMixin.js'
  export default {
    mixins: [ApplicationMixin],
    props: ['visible', 'slug'],
    data () {
      return {
        valid: true,
        role_id: null,
        formTemplates: [],
        subject: '',
        message: '',
        cc: '',
        bcc: '',
        invitations: [],
        invitationTemplate: {
          firstname: '',
          lastname: '',
          email: '',
          organisation: '',
          meta: {}
        },
        rules: {
          firstname: [
            v => !!v || 'First name is required'
          ],
          lastname: [
            v => !!v || 'Last name is required'
          ],
          email: [
            v => !!v || 'Email is required',
            v => validator.isEmail(v) || 'Email must be valid'
          ],
          role_id: [
            v => !!v || 'Application role is required'
          ],
          subject: [
            v => !!v || 'Subject is required'
          ]
        }
      }
    },
    computed: {
      show: {
        get () {
          return this.visible
        },
        set (value) {
          if (!value) {
            this.$emit('close')
          }
        }
      }
    },
    methods: {
      close () {
        this.show = false
        this.setForm()
      },
      addUser () {
        const newTemplate = _.merge({}, this.invitationTemplate)
        this.invitations.push(newTemplate)
      },
      bulkUpload () {
        this.$refs.fileUpload.click()
      },
      resetFile () {
        this.$refs.fileUpload.type = 'text'
        this.$refs.fileUpload.type = 'file'
      },
      onFilePicked (e) {
        const file = e.target.files[0] || null
        const _this = this
        papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete (results) {
            results.data.forEach((result) => {
              const invitation = _.merge({}, _this.invitationTemplate)
              for (const [key, val] of Object.entries(result)) {
                if (invitation.hasOwnProperty(key)) {
                  invitation[key] = val
                } else if (key) {
                  invitation.meta[key] = val
                }
              }
              _this.invitations.push(invitation)
            })
          }
        })
        this.resetFile()
      },
      removeUser (index) {
        this.invitations.splice(index, 1)
        if (!this.invitations.length) {
          const newTemplate = _.merge({}, this.invitationTemplate)
          this.invitations.push(newTemplate)
        }
      },
      validate () {
        if (this.$refs.form.validate()) {
          this.invite()
        }
      },
      invite () {
        this.show = false
        this.$store.dispatch('inviteApplication', { invitations: this.invitations, slug: this.slug, role_id: this.role_id, form_templates: this.formTemplates, cc: this.cc, bcc: this.bcc, subject: this.subject, message: this.message })
        this.setForm()
      },
      setForm () {
        const newTemplate = _.merge({}, this.invitationTemplate)
        this.invitations = []
        this.invitations.push(newTemplate)
        this.role_id = null
        this.formTemplates = []
        this.subject = 'You have been invited to join the ' + this.$_application.name + ' application on Informed 365'
        this.message = '<p>You have been invited to join the ' + this.$_application.name + ' application on Informed 365.<p>' +
        '<p>To get started simply navigate to {{invite_link}} and login or create an account using the email address that this invitation was sent to.</p>'
        this.cc = ''
        this.bcc = ''
      }
    },
    created: function () {
      this.setForm()
      this.$store.dispatch('loadFormTemplates', this.slug)
    }
  }
</script>
