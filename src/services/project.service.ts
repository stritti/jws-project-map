import base from "./airtable.service";
import type { Project } from "@/interfaces/Project";
import type { LatLng } from "leaflet";

const BASE_NAME = "Project";

const projectService = {
  getAll() {
    return new Promise((resolve, reject) => {
      const locations: Array<Project> = [];
      base(BASE_NAME)
        .select({
          sort: [{ field: "Name", direction: "asc" }],
          view: "published",
        })
        .eachPage(
          function page(partialRecords, fetchNextPage) {
            partialRecords.forEach((partialRecords) => {
              const item: Project = {
                id: partialRecords.id,
                name: partialRecords.fields.Name as string,
                teaserImg: partialRecords.fields?.TeaserImage as object[],
                category: partialRecords.fields?.Category as Array<string>,
                notes: partialRecords.fields.Notes
                  ? (partialRecords.fields.Notes as string)
                      .replaceAll('"<http', '"http')
                      .replaceAll('>"', '"')
                  : "",
                country: partialRecords.fields?.Country as Array<string>,
                latitude: partialRecords.fields?.Latitude as number,
                longitude: partialRecords.fields?.Longitude as number,
                link: partialRecords.fields?.Link as string,
                state: partialRecords.fields?.State as string,
                since: new Date(partialRecords.fields?.Since as string),
                gallery: partialRecords.fields?.Gallery as Array<object>,
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
  add(latLng: LatLng, name: string) {
    base(BASE_NAME).create([
      {
        fields: {
          Name: name,
          Published: "draft",
          Longitude: latLng.lng,
          Latitude: latLng.lat,
        },
      },
    ]);
  },
};

export default projectService;
