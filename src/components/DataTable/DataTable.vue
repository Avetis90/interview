<template>
  <v-card class="data-table">
    <v-card-title class="header-control" v-if="!anySelected">
      <div class="subheading font-weight-medium mx-2">
        <span>{{title}}</span>
        <span class="grey--text">{{ subtitle }}</span>
      </div>
      <v-spacer></v-spacer>
      <v-tooltip bottom>
        <v-btn class="my-0" flat icon @click.stop="manageColumns = true" slot="activator">
          <v-icon>settings</v-icon>
        </v-btn>
        <span>Manage columns</span>
      </v-tooltip>
      <v-tooltip bottom>
        <v-btn class="my-0" flat icon @click.stop="searching = !searching" slot="activator">
          <v-icon>search</v-icon>
        </v-btn>
        <span>Search {{ lowerCaseTitle }}</span>
      </v-tooltip>
      <v-tooltip bottom>
        <v-btn class="my-0" flat icon @click.stop="download" slot="activator">
          <v-icon>save_alt</v-icon>
        </v-btn>
        <span>Download {{ lowerCaseTitle }}</span>
      </v-tooltip>
      <v-tooltip bottom v-if="canRefresh">
        <v-btn class="my-0" flat icon @click.stop="refreshItems()" slot="activator">
          <v-icon>refresh</v-icon>
        </v-btn>
        <span>Refresh {{ lowerCaseTitle }}</span>
      </v-tooltip>
      <v-tooltip bottom v-if="canCreate">
        <v-btn class="my-0" fab small depressed color="success" @click.stop="createItem()" slot="activator">
          <v-icon>add</v-icon>
        </v-btn>
        <span>Create {{ lowerCaseTitle }} </span>
      </v-tooltip>
    </v-card-title>
    <v-card-title v-else class="header-control selected">
      <div class="subheading font-weight-medium mx-2">
        <span class="grey--text text--darken-2">{{ selectedSubtitle }}</span>
      </div>
      <v-spacer></v-spacer>
      <v-tooltip bottom>
        <v-btn class="my-0" flat icon @click.stop="confirmDelete = true" slot="activator">
          <v-icon>delete</v-icon>
        </v-btn>
        <span>Delete {{ lowerCaseTitle }}</span>
      </v-tooltip>
    </v-card-title>
    <v-divider></v-divider>
    <template v-if="searching">
      <v-card-title>
        <v-layout>
          <v-flex xs12>
            <v-text-field
              class="pa-0 my-0 mx-2"
              v-model="search"
              label="Search"
              single-line
              hide-details
            ></v-text-field>
          </v-flex>
        </v-layout>
      </v-card-title>
      <v-divider></v-divider>
    </template>
    <v-card class="elevation-1">
      <v-data-table
        ref="data"
        v-model="selected"
        :headers="visibleHeaders"
        :items="tableItems"
        :loading="loading"
        :rows-per-page-items="rowsPerPageItems"
        :search="search"
        :select-all="canDelete"
        :pagination.sync="computedPagination"
        :total-items="itemsLength"
        :hide-actions="externalPagination"
        item-key="id"
      >
        <template v-slot:items="props">
          <td v-if="canDelete">
            <v-checkbox
              v-model="props.selected"
              color="primary"
              hide-details
            ></v-checkbox>
          </td>
          <td 
            v-for="header in visibleHeaders" 
            v-bind:key="header.value"
            @click.stop="itemClicked(props.item)"
            :class="getClickableClass"
          >
            {{ props.item[header.value] }}
          </td>
        </template>
      </v-data-table>
      <template v-if="externalPagination">
        <PaginationExternal
          :rows-per-page-items="rowsPerPageItems"
          :pagination.sync="computedPagination"
          :loading="loading"
          @updatePage="updatePage"
          @updateRows="updateRows"
        ></PaginationExternal>
      </template>
    </v-card>

    <!-- // Manage Columns -->
    <v-dialog
      v-model="manageColumns"
      width="600"
      scrollable
    >
      <v-card class="manage-columns">
        <v-toolbar
          flat
          dark
          color="primary">
          <v-toolbar-title>Manage columns</v-toolbar-title>
        </v-toolbar>

        <v-card-text class="item-list pa-0">
          <v-list>
            <template v-for="(header, index) in tableHeaders">
              <v-list-tile :key="header.value">
                <v-list-tile-action>
                  <v-checkbox 
                    color="primary"
                    v-model="header.visible"
                    hide-details
                  ></v-checkbox>
                </v-list-tile-action>
                <v-list-tile-content>
                  <v-list-tile-title>{{ header.text }}</v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
              <v-divider
                v-if="index + 1 < tableHeaders.length"
                :key="index"
              ></v-divider>
            </template>
          </v-list>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
            <v-btn 
              flat 
              @click.stop="manageColumns = false"
            >OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- // Delete Confirmation -->
    <v-dialog 
      v-model="confirmDelete"
      width="600">

      <v-card>
        <v-toolbar
          flat
          dark
          color="primary">
          <v-toolbar-title>Confirm deleting {{ lowerCaseTitle }}</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          This action will delete {{ numberSelected }} {{ lowerCaseTitle }}. Are you sure you want to continue?
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
            <v-btn
              flat
              @click.stop="confirmDelete = false"
            >Cancel</v-btn>
            <v-btn
              color="primary"
              @click.stop="deleteItems()"
            >Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-card>
  
</template>

<script>
/**
 *    Props: title, headers, items, loading, itemKey, pagination
 *    Events: @delete, @refresh, @click, @create.
 *    TODO:
 *    - Add filter bar
 */
import papa from 'papaparse'
import get from 'lodash/get'
import { saveAs } from 'file-saver'
const PaginationExternal = () => import('./components/PaginationExternal')
export default {
  name: 'DataTable',
  props: {
    // The type of item the table is displaying
    title: {
      type: String,
      default: 'Items'
    },
    // The header row for the table including settings. See vuetify datatables
    headers: {
      type: Array,
      default: () => []
    },
    // The items to be displayed in the data table. Should match the headers
    items: {
      type: Array,
      default: () => []
    },
    // Set the datatable to loading or loaded
    loading: {
      type: Boolean,
      default: false
    },
    // The property in the items array which should be passed back to the parent on events such as delete or click
    itemKey: {
      type: String
    },
    // The pagination settings for the data table such as sort column and order
    pagination: {
      type: Object,
      default: () => {}
    },
    // Set if we use default pagination or external pagination
    externalPagination: {
      type: Boolean,
      default: false
    }
  },
  components: {
    PaginationExternal
  },
  data () {
    return {
      selected: [],
      search: '',
      searching: false,
      manageColumns: false,
      confirmDelete: false,
      tableHeaders: [],
      rowsPerPageItems: [25, 50, 100, { text: 'All', value: -1 }]
    }
  },
  computed: {
    subtitle () {
      return '| Showing ' + this.numberOfItemsShowing + ' ' + this.lowerCaseTitle
    },
    numberOfItemsShowing () {
      return this.search.length && this.$refs.data.filteredItems.length < this.tableItems.length ? this.$refs.data.filteredItems.length + ' of ' + this.tableItems.length : 'all'
    },
    lowerCaseTitle () {
      return this.title.toLowerCase()
    },
    numberSelected () {
      return this.selected.length
    },
    anySelected () {
      return this.numberSelected > 0
    },
    selectedSubtitle () {
      return this.numberSelected + ' ' + this.lowerCaseTitle + ' selected'
    },
    visibleHeaders () {
      return this.tableHeaders.filter(header => header.visible !== false)
    },
    tableItems () {
      return this.items.slice()
    },
    canDelete () {
      return this.$listeners && this.$listeners.hasOwnProperty('delete')
    },
    canRefresh () {
      return this.$listeners && this.$listeners.hasOwnProperty('refresh')
    },
    canClick () {
      return this.$listeners && this.$listeners.hasOwnProperty('click')
    },
    canCreate () {
      return this.$listeners && this.$listeners.hasOwnProperty('create')
    },
    getClickableClass () {
      return this.canClick ? 'clickable' : ''
    },
    itemsLength () {
      return get(this.computedPagination, 'totalItems', undefined)
    },
    computedPagination: {
      get () {
        return this.pagination
      },
      set (value) {
        if ((value && this.pagination && value.page === this.pagination.page) || value.external === true) {
          value.external = false
          this.$emit('update:pagination', value, this.title)
        }
      }
    }
  },
  methods: {
    getFileName () {
      return this.title + ' ' + this.$_getDateTime() + '.csv'
    },
    getData () {
      let data = []
      this.tableItems.forEach(item => {
        let row = {}
        this.visibleHeaders.forEach(header => {
          row[header.text] = item[header.value] || ''
        })
        data.push(row)
      })
      return data
    },
    download () {
      const BOM = '\uFEFF'
      const data = this.getData()
      const csv = BOM + papa.unparse(data)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
      saveAs(blob, this.getFileName())
    },
    setHeaders () {
      let headers = this.headers.slice()
      this.headers.forEach(header => {
        header.visible = header.hasOwnProperty('visible') ? header.visible : true
      })
      this.tableHeaders = headers
    },
    itemClicked (item) {
      this.$emit('click', item[this.itemKey])
    },
    deleteItems () {
      this.confirmDelete = false
      let items = this.selected.slice().map(item => item[this.itemKey])
      this.$emit('delete', items)
      this.selected = []
    },
    refreshItems () {
      this.$emit('refresh')
    },
    createItem () {
      this.$emit('create')
    },
    updatePage (page) {
      this.computedPagination = { ...this.computedPagination, page: page, external: true }
    },
    updateRows (rows) {
      this.computedPagination = { ...this.computedPagination, rowsPerPage: rows }
    }
  },
  watch: {
    headers: {
      immediate: true,
      handler () {
        this.setHeaders()
      }
    }
  }
}
</script>

<style>
  .data-table .v-table thead tr {
    background-color: #f5f5f5;
  }
  .data-table .v-table tbody tr[active],
  .data-table .v-table tbody tr:hover,
  .data-table .header-control.selected {
    background: #e8f0fe !important;
  }
  .manage-columns .item-list {
    max-height:400px;
  }
  .data-table {
    width:100%;
  }
  .data-table .clickable {
    cursor:pointer;
  }
</style>
