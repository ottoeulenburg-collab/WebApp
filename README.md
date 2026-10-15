# WISSENWELT

Eine mobile, installierbare Web-App zum spielerischen Lernen von Allgemeinwissen.

## Enthalten

- 200 unterschiedliche Kreuzworträtsel mit je mindestens acht Begriffen, Buchstabenhilfe, Prüfung und gespeichertem Fortschritt
- 69 Quizfragen aus verschiedenen Kategorien; Runden mit 10 oder 20 zufälligen Fragen, Erklärungen und Zusatzfakten
- 30 Faktenkarten zum Wischen mit ausführlicherer Kurz-Erklärung und Merken-Funktion
- Startbildschirm, Handy-Navigation, App-Symbol und Offline-Speicherung nach dem ersten Laden

## Auf dem Handy nutzen

Die Dateien müssen auf einem Webserver mit HTTPS liegen. Lade den gesamten Ordner `wissenswelt` auf einen Webspace hoch und öffne die Adresse auf dem Handy. Auf dem iPhone: in Safari **Teilen → Zum Home-Bildschirm**. Auf Android: in Chrome **Menü → App installieren** oder **Zum Startbildschirm hinzufügen**.

Zum Testen am Computer im Ordner `wissenswelt` einen lokalen Webserver starten, z. B. `python3 -m http.server 8765`, und `http://localhost:8765` öffnen. Ein direktes Öffnen der HTML-Datei per Doppelklick genügt wegen der JavaScript-Module nicht.

Der Lernfortschritt liegt nur im lokalen Speicher des jeweiligen Browsers. Es gibt noch keine Synchronisierung zwischen Geräten und keine Veröffentlichung im App Store oder Play Store.
