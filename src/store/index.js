import Vue from 'vue'
import Vuex from 'vuex'

import acl from './acl'
import accessSettings from './accessSettings'
import application from './application'
import organisation from './organisation'
import formTemplate from './formTemplate'
import user from './user'
import organisationuser from './organisationuser'
import section from './section'
import question from './question'
import answer from './answer'
import form from './form'
import response from './response'
import validation from './validation'
import trigger from './trigger'
import meta from './meta'
import note from './note'
import workflow from './workflow'
import auth from './auth'
import shared from './shared'

Vue.use(Vuex)

export const store = new Vuex.Store({
  modules: {
    acl: acl,
    accessSettings: accessSettings,
    auth: auth,
    application: application,
    organisation: organisation,
    formTemplate: formTemplate,
    user: user,
    organisationuser: organisationuser,
    section: section,
    question: question,
    answer: answer,
    form: form,
    response: response,
    validation: validation,
    trigger: trigger,
    meta: meta,
    note: note,
    workflow: workflow,
    shared: shared
  }
})
