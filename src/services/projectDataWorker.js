// Dieser Worker wird nicht mehr verwendet, da die direkte Verarbeitung schneller ist
// für das initiale Laden. Der Code bleibt als Referenz erhalten.

self.onmessage = function(e) {
  self.postMessage([]);
};
