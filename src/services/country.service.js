import base from './airtable.service';

const BASE_NAME = 'Country';

const categoryService = {
  getAll() {
    return new Promise((resolve, reject) => {
      const locations = [];
      base(BASE_NAME)
        .select({
          sort: [{ field: 'Name', direction: 'asc' }],
          filterByFormula: 'COUNTA(Project) > 0',
        })
        .eachPage(
          function page(partialRecords, fetchNextPage) {
            partialRecords.forEach((partialRecords) => {
              locations.push({
                id: partialRecords.id,
                name: partialRecords.fields?.Name,
                code: partialRecords.fields?.Code,
              });
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
};

export default categoryService;
