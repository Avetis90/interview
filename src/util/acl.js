import { generateResourceKey } from './../util/resource'

export const ABILITIES = {
  SHOW: 'show'
}

/**
 *
 * @param Array<string> permissions Array of permissions for a particular ability
 * @param string resourceName The name literal of the resource being checked
 * @param Object resource A resource object
 * @param string resource.access_level The resources current access_level
 * @param number resource.id The resources id
 */
export const isPermissible = (permissions = [], resourceName, resource) => {
  // If not private, exit early
  if (resource.access_level !== 'private') {
    return true
  }

  return permissions.indexOf(generateResourceKey(resourceName, resource.id)) !== -1
}
