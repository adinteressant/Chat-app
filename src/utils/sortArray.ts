export const sortArray = (array: any) => {
  for (let i = 0; i < array.length; i++) {
    for (let j = i + 1; j < array.length; j++) {
      const iHasField = array[i].latestMessageAt !== undefined
      const jHasField = array[j].latestMessageAt !== undefined
      // If i doesn't have the field but j does, swap
      if (!iHasField && jHasField) {
        let temp = array[i]
        array[i] = array[j]
        array[j] = temp
      }
      // If both have the field, sort by date (descending)
      else if (iHasField && jHasField) {
        if (array[i].latestMessageAt < array[j].latestMessageAt) {
          let temp = array[i]
          array[i] = array[j]
          array[j] = temp
        }
      }
      else if (array[i].status=='pending' && array[j].status=='accepted'){
        let temp = array[i]
        array[i] = array[j]
        array[j] = temp
      }
      // If only i has field and j doesn't, no swap needed (correct order)
      // If neither has field, no swap needed
    }
  }
}
