import base from './airtable.service'
import categoryService from '@/services/category.service'

const BASE_NAME = 'Project'

const projectService = {
  getLocations () {
    return new Promise((resolve, reject) => {
      categoryService.getAll().then((categories) => {

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
                  latitude: partialRecords.fields?.Latitude,
                  longitude: partialRecords.fields?.Longitude,
                  link: partialRecords.fields?.Link,
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
              // console.log('Locations: ', locations)
              locations.forEach(item => {
                item.category.forEach( (obj, i) => {
                  item.category[i] = categories.find((category) => obj === category.id)
                })
                item.category.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
              })
              resolve(locations)
            })
          })
      })
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
            category: record.fields?.Category,
            notes: record.fields.Notes ? record.fields.Notes.replaceAll('"<http', '"http').replaceAll('>"', '"'): "",
            latitude: record.fields?.Latitude,
            longitude: record.fields?.Longitude,
            link: record.fields?.Link,
            gallery: record.fields?.Gallery
          })
          resolve(project)
        })
    })
  }
}

export default projectService
