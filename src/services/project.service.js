import base from './airtable.service'

const BASE_NAME = 'Project'

const projectService = {
  getLocations () {
    return new Promise((resolve, reject) => {
      const locations = []
      base(BASE_NAME)
        .select({
          view: 'published'
        }).eachPage(
          function page (partialRecords, fetchNextPage) {
            partialRecords.forEach((partialRecords) => {
              locations.push({
                id: partialRecords.id,
                name: partialRecords.fields?.Name,
                teaserImg: partialRecords.fields?.TeaserImage,
                type: partialRecords.fields?.Type,
                notes: partialRecords.fields.Notes ? partialRecords.fields.Notes.replaceAll('"<http', '"http').replaceAll('>"', '"'): "",
                latitude: partialRecords.fields?.Latitude,
                longitude: partialRecords.fields?.Longitude,
                link: partialRecords.fields?.Link,
              })
            })
            fetchNextPage()
          }, function done (err) {
            if (err) {
              console.log(err)
              reject(err)
            }
            // console.log('Locations: ', locations)
            resolve(locations)
          })
    })
  },

  getLocationTypeImage (location) {
    const imageName = location.type
      .toLowerCase()
      .replace(' ', '-')
      .replace('/', '-')
    try {
      return `/pins/${imageName}.png`
    } catch (e) {
      console.error(`No icon associated to this location type '${location.type}': ${imageName}.png`)
      return null
    }
  }
}

export default projectService
