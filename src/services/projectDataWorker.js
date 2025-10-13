// Web Worker für die Verarbeitung von Projektdaten
// Dies wird in einem separaten Thread ausgeführt und entlastet den Hauptthread

// Konstanten für Feldvalidierung
const REQUIRED_FIELDS = ['Id', 'Name', 'Latitude', 'Longitude', 'State'];

self.onmessage = function(e) {
  const { response, forMapOnly } = e.data;

  try {
    // Prüfen, ob die Antwort gültig ist
    if (!response || !response.list || !Array.isArray(response.list)) {
      throw new Error('Invalid response format');
    }

    // Optimierte Verarbeitung für schnelleres Laden
    const locations = [];
    const list = response.list;
    const listLength = list.length;
    
    // Direkte Iteration über die Liste ohne zusätzliche Funktionsaufrufe
    for (let i = 0; i < listLength; i++) {
      const record = list[i];
      
      // Validierung der erforderlichen Felder
      let isValid = true;
      for (let j = 0; j < REQUIRED_FIELDS.length; j++) {
        const field = REQUIRED_FIELDS[j];
        if (record[field] === undefined || record[field] === null) {
          isValid = false;
          break;
        }
      }
      
      if (!isValid) continue;
      
      // Basis-Objekt mit den für die Karte notwendigen Feldern
      const project = {
        id: record.Id,
        name: record.Name,
        category: record.Category || [],
        country: record.Country && record.Country.length > 0 ? record.Country[0] : null,
        latitude: Number(record.Latitude),
        longitude: Number(record.Longitude),
        state: record.State,
      };
      
      // Prüfen, ob Koordinaten gültig sind
      if (isNaN(project.latitude) || isNaN(project.longitude)) {
        continue;
      }
      
      // Nur die zusätzlichen Felder hinzufügen, wenn nicht nur für die Karte
      if (!forMapOnly) {
        project.teaserImg = record.TeaserImage || [];
        project.notes = record.Notes
          ? record.Notes
              .replaceAll('"<http', '"http')
              .replaceAll('>"', '"')
          : "";
        project.link = record.Link || "";
        project.since = record.Since ? new Date(record.Since) : null;
        project.gallery = record.Gallery || [];
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
