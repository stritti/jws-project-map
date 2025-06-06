// Web Worker für die Verarbeitung von Projektdaten
// Dies wird in einem separaten Thread ausgeführt und entlastet den Hauptthread

self.onmessage = function(e) {
  const response = e.data;

  try {
    const locations = ((response) => {
      return response.list.map(record => ({
        id: record.Id,
        name: record.Name,
        teaserImg: record.TeaserImage,
        category: record.Category,
        notes: record.Notes
          ? record.Notes
              .replaceAll('"<http', '"http')
              .replaceAll('>"', '"')
          : "",
        country: (record?.Country)[0] || null,
        latitude: record.Latitude,
        longitude: record.Longitude,
        link: record.Link,
        state: record.State,
        since: record.Since ? new Date(record.Since) : null,
        gallery: record.Gallery,
      }));
    })(response);

    // Sende die verarbeiteten Daten zurück an den Hauptthread
    self.postMessage(locations);
  } catch {
    self.postMessage([]);
  }
};
