<template>
  <div class="v-datatable v-table theme--light">
    <div class="v-datatable__actions">
      <div class="v-datatable__actions__select">
        Rows per page:
        <v-select
          :items="rowsPerPageItems"
          hide-details
          v-model="externalPagination.rowsPerPage"
          @change="changeRows()"
          :disabled="loading"
          >
        </v-select>
      </div>
      <div class="v-datatable__actions__range-controls">
        <div class="v-datatable__actions__pagination">{{ showingRows }}</div>
        <v-btn flat icon :disabled="previousButtonDisabled" @click.stop="previousPage()">
          <v-icon>chevron_left</v-icon>
        </v-btn>
        <v-btn flat icon :disabled="nextButtonDisabled" @click.stop="nextPage()">
          <v-icon>chevron_right</v-icon>
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import get from 'lodash/get'
export default {
  name: 'PaginationExternal',
  props: {
    rowsPerPageItems: {
      type: Array,
      required: true
    },
    pagination: {
      type: Object,
      required: true
    },
    loading: {
      type: Boolean,
      required: true
    }
  },
  data () {
    return {
      externalPagination: { ...this.pagination }
    }
  },
  computed: {
    rowsPerPage () {
      return get(this.externalPagination, 'rowsPerPage')
    },
    toLabel () {
      return this.rowsPerPage === -1 ? get(this.externalPagination, 'totalItems') : get(this.externalPagination, 'to')
    },
    fromLabel () {
      return this.rowsPerPage === -1 ? 1 : get(this.externalPagination, 'from')
    },
    pages () {
      return [ this.fromLabel, this.toLabel ].filter(p => p)
    },
    showingRows () {
      return this.pages.length ? this.currentRows : '--'
    },
    currentRows () {
      return this.pages.join(' - ') + ' of ' + get(this.externalPagination, 'totalItems')
    },
    previousButtonDisabled () {
      return this.loading || this.rowsPerPage === -1 || get(this.externalPagination, 'from') === 1
    },
    nextButtonDisabled () {
      return this.loading || this.rowsPerPage === -1 || get(this.externalPagination, 'to') >= get(this.externalPagination, 'totalItems')
    }
  },
  methods: {
    previousPage () {
      this.$emit('updatePage', this.externalPagination.page - 1)
    },
    nextPage () {
      this.$emit('updatePage', this.externalPagination.page + 1)
    },
    changeRows () {
      this.$emit('updateRows', this.externalPagination.rowsPerPage)
    }
  },
  watch: {
    pagination: {
      handler () {
        this.externalPagination = this.pagination
      },
      deep: true
    }
  }
}
</script>
