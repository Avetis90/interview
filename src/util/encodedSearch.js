import _ from 'lodash'

function extractData (queryKey) {
  let data = {}
  try {
    const queryValue = decodeURIComponent(window.location.search.replace(`?${queryKey}=`, ''))
    const jsonString = window.atob(queryValue)
    data = JSON.parse(jsonString)
  } catch (e) {
    // A valid "catch" exception. The search value not be present, etc.
  }

  return data
}

export function extractRegistrationDetails () {
  return _.defaults({}, extractData('invite'), { email: '', firstname: '', lastname: '' })
}

export function extractLoginDetails () {
  return _.defaults({}, extractData('invite'), { email: '' })
}
