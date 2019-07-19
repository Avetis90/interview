<template>
  <v-layout row wrap>
    <v-flex sm12 class="abn-search">
      <v-text-field
        label='Search for an Australian Business Number (ABN)'
        type='number'
        v-model='search'
        class="mt-3"
        :error-messages="this.message"
      >
        <template v-slot:append-outer>
          <v-btn
            @click="getResults()"
          >Search
          </v-btn>
        </template>
      </v-text-field>
    </v-flex>

    <v-layout row wrap v-if="hasResult && !selectBusinessName">
      <v-flex xs12 sm3>
        <v-text-field
          label="Business Name"
          :value="result.BusinessName"
          readonly
        ></v-text-field>
      </v-flex>
      <v-flex xs12 sm4 offset-sm1>
        <v-text-field
          label="Entity Name"
          :value="result.EntityName"
          readonly
        ></v-text-field>
      </v-flex>
      <v-flex xs12 sm3 offset-sm1>
        <v-text-field
          label="Entity Type"
          :value="result.EntityTypeName"
          readonly
        ></v-text-field>
      </v-flex>
    </v-layout>

    <v-layout row wrap v-if="selectBusinessName">
      <v-flex xs12>
        <div class="body-1">Multiple business names found, please select one.</div>
      </v-flex>
      <v-flex xs12>
        <v-autocomplete
          label="Business Name"
          :items="businessNames"
          v-model="businessName"
          @change="setBusinessName()"
        >
        </v-autocomplete>
      </v-flex>
    </v-layout>
  </v-layout>
</template>

<script>
import fetchJsonp from 'fetch-jsonp'
import get from 'lodash/get'
export default {
  name: 'abn-lookup',
  props: {
    question: {
      type: String,
      required: true
    },
    answers: {
      type: Array,
      required: true
    },
    responses: {
      type: Array,
      required: true
    },
    disabled: {
      type: Boolean,
      required: true
    }
  },
  data () {
    return {
      search: '',
      result: {},
      businessName: ''
    }
  },
  computed: {
    message () {
      return this.result.Message
    },
    hasResult () {
      return this.result.Abn && this.result.Abn.length
    },
    selectBusinessName () {
      return this.hasResult && Array.isArray(this.result.BusinessName)
    },
    businessNames () {
      return this.selectBusinessName ? this.result.BusinessName.sort() : []
    }
  },
  methods: {
    async getResults () {
      this.result = {}
      const url = 'https://abr.business.gov.au/json/AbnDetails.aspx'
      this.result = await fetchJsonp(url + '?abn=' + this.search + '&guid=' + process.env.ABR_GUID).then(response => response.json())
      this.result.BusinessName = this.result.BusinessName.length < 2 ? this.result.BusinessName.shift() : this.result.BusinessName
      this.saveResponse()
    },
    setBusinessName () {
      this.result.BusinessName = this.result.BusinessName.find(bn => bn === this.businessName)
      this.saveResponse()
    },
    saveResponse () {
      if (this.result.Abn && !Array.isArray(this.result.BusinessName)) {
        this.answers.forEach(a => {
          const response = this.result[a.answer] || null
          if (response) {
            const existingResponse = this.responses.find(r => r.answer_id === a.id)
            if (existingResponse) {
              if (existingResponse.response !== response) {
                this.$emit('delete-response', existingResponse.id)
                this.$emit('create-response', [a.id, response])
              }
            } else {
              this.$emit('create-response', [a.id, response])
            }
          }
        })
      }
    },
    setResponse () {
      this.answers.forEach(answer => {
        this.result[answer.answer] = get(this.responses.find(r => r.answer_id === answer.id), 'response')
      })
      this.search = this.result.Abn || ''
    }
  },
  created () {
    this.setResponse()
  }
}
</script>

<style>
  .abn-search .v-input__control {
    margin-top:14px;
  }
  .abn-search .v-text-field {
    margin-top:0px !important;
  }
</style>
