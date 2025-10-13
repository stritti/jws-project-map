// Web Worker für die Verarbeitung von Projektdaten
// Dies wird in einem separaten Thread ausgeführt und entlastet den Hauptthread

self.onmessage = function(e) {
  const { response, forMapOnly } = e.data;

  try {
    // Optimierte Verarbeitung für schnelleres Laden
    const locations = [];
    
    // Direkte Iteration über die Liste ohne zusätzliche Funktionsaufrufe
    for (let i = 0; i < response.list.length; i++) {
      const record = response.list[i];
      
      // Basis-Objekt mit den für die Karte notwendigen Feldern
      const project = {
        id: record.Id,
        name: record.Name,
        category: record.Category,
        country: record.Country && record.Country.length > 0 ? record.Country[0] : null,
        latitude: record.Latitude,
        longitude: record.Longitude,
        state: record.State,
      };
      
      // Nur die zusätzlichen Felder hinzufügen, wenn nicht nur für die Karte
      if (!forMapOnly) {
        project.teaserImg = record.TeaserImage;
        project.notes = record.Notes
          ? record.Notes
              .replaceAll('"<http', '"http')
              .replaceAll('>"', '"')
          : "";
        project.link = record.Link;
        project.since = record.Since ? new Date(record.Since) : null;
        project.gallery = record.Gallery;
      }
      
      locations.push(project);
    }

    // Sende die verarbeiteten Daten zurück an den Hauptthread
    self.postMessage(locations);
  } catch (error) {
    console.error("Worker error:", error);
    self.postMessage([]);
  }
};
