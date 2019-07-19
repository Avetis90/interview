<template>
  <v-layout row wrap>
    <v-flex d-flex xs12>
      <h1 class='headline primary--text py-3'>Notes</h1>
    </v-flex>
    <v-flex d-flex xs12>
      <p>Select an existing note below or <a href='#' @click.stop='showEdit = true'>create a new note</a>.</p>
    </v-flex>
    <v-flex d-flex xs12>
      <NotesTable></NotesTable>
    </v-flex>
    <NotesEdit :show="showEdit" @close="showEdit = false"></NotesEdit>
  </v-layout>
</template>
<script>
  const NotesTable = () => import('./NotesTable')
  const NotesEdit = () => import('./NotesEdit')
  export default {
    name: 'NotesList',
    components: {
      NotesTable,
      NotesEdit
    },
    data () {
      return {
        showEdit: false
      }
    }
  }
</script>
