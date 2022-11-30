import base from './airtable.service';

const BASE_NAME = 'Category';

const categoryService = {
  getAll() {
    return new Promise((resolve, reject) => {
      const items = [];
      base(BASE_NAME)
        .select({
          sort: [{ field: 'Name', direction: 'asc' }],
          filterByFormula: 'COUNTA(Project) > 0',
        })
        .eachPage(
          function page(partialRecords, fetchNextPage) {
            partialRecords.forEach((partialRecords) => {
              items.push({
                id: partialRecords.id,
                name: partialRecords.fields?.Name,
                color: partialRecords.fields?.Color,
              });
            });
            fetchNextPage();
          },
          function done(err) {
            if (err) {
              console.log(err);
              reject(err);
            }
            resolve(items);
          }
        );
    });
  },
};

export default categoryService;
