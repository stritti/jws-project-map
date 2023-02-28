import base from './airtable.service'
import type { Project } from '@/interfaces/Project'

const BASE_NAME = 'Project';

const projectService = {
  getAll() {
    return new Promise((resolve, reject) => {
      const locations:Array<Project> = [];
      base(BASE_NAME)
        .select({
          sort: [{ field: 'Name', direction: 'asc' }],
          view: 'published',
        })
        .eachPage(
          function page(partialRecords, fetchNextPage) {
            partialRecords.forEach((partialRecords) => {
              let item:Project = {
                id: partialRecords.id,
                name: partialRecords.fields.Name as string,
                teaserImg: partialRecords.fields?.TeaserImage as object[],
                category: partialRecords.fields?.Category,
                notes: partialRecords.fields.Notes
                  ? partialRecords.fields.Notes.replaceAll(
                      '"<http',
                      '"http'
                    ).replaceAll('>"', '"')
                  : '',
                country: partialRecords.fields?.Country ,
                latitude: partialRecords.fields?.Latitude as number,
                longitude: partialRecords.fields?.Longitude as number,
                link: partialRecords.fields?.Link as string,
                state: partialRecords.fields?.State,
                since: partialRecords.fields?.Since,
                gallery: partialRecords.fields?.Gallery,
              };

              locations.push(item);
            });
            fetchNextPage();
          },
          function done(err) {
            if (err) {
              console.log(err);
              reject(err);
            }
            resolve(locations);
          }
        );
    });
  },
  add(latLng, name) {
    base(BASE_NAME).create([
      {
        fields: {
          Name: name,
          Published: 'draft',
          Longitude: latLng.lng,
          Latitude: latLng.lat,
        },
      },
    ]);
  },
};

export default projectService;
