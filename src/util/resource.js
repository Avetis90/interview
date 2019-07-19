/**
 * A small resource utility for assisting in keeping the flux store flattened
 *
 * @param string resource name - eg form_templates
 * @param number id - the unique id representing a particular instance of the resource
 */
export const generateResourceKey = (resource, id) => `${resource}__${id}`
