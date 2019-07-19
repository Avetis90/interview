export default {
  methods: {
    validation (password) {
      let lowercaseCount = 0
      let uppercaseCount = 0
      let numberCount = 0
      let specialCount = 0
      for (let i = password.length - 1; i >= 0; i--) {
        const element = password[i]
        if ((" !\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~").indexOf(element) !== -1) {
          specialCount++
        } else if (!isNaN(element)) {
          numberCount++
        } else if (element === element.toUpperCase()) {
          uppercaseCount++
        } else if (element === element.toLowerCase()) {
          lowercaseCount++
        }
      }
      if (uppercaseCount < 1) {
        return 'Password must have at least 1 uppercase character (A-Z).'
      }
      if (lowercaseCount < 1) {
        return 'Password must have at least 1 lowercase character (a-z).'
      }
      if (numberCount < 1) {
        return 'Password mast have at least 1 digit (0-9).'
      }
      if (specialCount < 1) {
        return 'Password must have at least 1 special character (punctuation).'
      }
      if (password.length < 10) {
        return 'Password must be at least 10 characters'
      }
      return true
    }
  }
}
