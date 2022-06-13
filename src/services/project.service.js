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
    if( location?.type) {
      const imageName = location.type
        .toLowerCase()
        .replace(' ', '-')
        .replace('+', '-')
        .replace('/', '-')

      return `/pins/${imageName}.png`
    } else {
      return '/pins/default.png'
    }
  },
  getProject (id) {
    return new Promise((resolve, reject) => {
      base(BASE_NAME)
        .find(id, function (err, record) {
          if (err) {
            console.error(err)
            reject(err)
          }
          const project = ({
            id: record.id,
            name: record.fields?.Name,
            teaserImg: record.fields?.TeaserImage,
            type: record.fields?.Type,
            notes: record.fields.Notes ? record.fields.Notes.replaceAll('"<http', '"http').replaceAll('>"', '"'): "",
            latitude: record.fields?.Latitude,
            longitude: record.fields?.Longitude,
            link: record.fields?.Link,
          })
          resolve(project)
        })
    })
  }
}

export default projectService
