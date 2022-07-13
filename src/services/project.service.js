import base from './airtable.service'

const BASE_NAME = 'Project'

const projectService = {
  getAll () {
    return new Promise((resolve, reject) => {
        const locations = []
        base(BASE_NAME)
          .select({
            view: 'published'
          }).eachPage(
            function page (partialRecords, fetchNextPage) {
              partialRecords.forEach((partialRecords) => {
                let item = {
                  id: partialRecords.id,
                  name: partialRecords.fields?.Name,
                  teaserImg: partialRecords.fields?.TeaserImage,
                  category: partialRecords.fields?.Category,
                  notes: partialRecords.fields.Notes ? partialRecords.fields.Notes.replaceAll('"<http', '"http').replaceAll('>"', '"'): "",
                  country: partialRecords.fields?.Country,
                  latitude: partialRecords.fields?.Latitude,
                  longitude: partialRecords.fields?.Longitude,
                  link: partialRecords.fields?.Link,
                  state: partialRecords.fields?.State,
                  since: partialRecords.fields?.Since,
                  gallery: partialRecords.fields?.Gallery
                }

                locations.push(item)
              })
              fetchNextPage()
            }, function done (err) {
              if (err) {
                console.log(err)
                reject(err)
              }
              resolve(locations)
            })
          })
  },
  add(latLng, name) {
    base(BASE_NAME).create([{
      fields: {
        Name: name,
        Published: "draft",
        Longitude: latLng.lng,
        Latitude: latLng.lat,
      }
    }])
  }
}

export default projectService
