# Setup-Anleitung – unibz Marketing Grundlagen

## Schnellstart (5 Minuten)

### Schritt 1: GitHub Pages aktivieren

1. Öffne: https://github.com/ChristianBaccarella/unibz-marketing-exercise/settings/pages
2. Unter **Source**: wähle **Deploy from a branch**
3. Branch: **main** · Ordner: **/ (root)**
4. Klicke **Save**
5. Warte 2–3 Minuten

### Schritt 2: App aufrufen

- **Studierende:** `https://christianbaccarella.github.io/unibz-marketing-exercise/`
- **Lehrperson:** `https://christianbaccarella.github.io/unibz-marketing-exercise/teacher.html`

---

## Unterricht durchführen

### Für die Lehrperson

1. Öffne das **Lehrendes Dashboard** (`teacher.html`)
2. Gib deinen Namen ein und klicke **Neue Sitzung starten**
3. Ein **6-stelliger Sitzungscode** wird generiert (z. B. `AB12CD`)
4. Zeige den QR-Code oder den Link auf dem Beamer
5. Studierende besuchen den Link und geben den Sitzungscode ein
6. Verfolge den Fortschritt in Echtzeit im Dashboard

### Für Studierende

1. Öffne den Link der Lehrperson (oder scanne den QR-Code)
2. Gib deinen Namen ein
3. Trage den Sitzungscode der Lehrperson ein (optional)
4. Klicke **Übung starten**
5. Bearbeite die drei Übungen (90 Minuten)
6. Exportiere am Ende deine Ergebnisse

---

## Gamification

| Aktion | Punkte |
|--------|--------|
| Kurze Antwort | 10 Punkte |
| Ausführliche Antwort (>60 Zeichen) | 20 Punkte |
| Übung abschließen | 50 Punkte |

### Badges

| Badge | Bedingung |
|-------|-----------|
| 🌟 Erster Schritt | 1 Antwort |
| 📝 Fleißig | 5 Antworten |
| 💪 Engagiert | 10 Antworten |
| 🏅 Hundert Punkte | 100 Punkte |
| 🥇 Highscorer | 250 Punkte |
| ✅ Nutzenversprechen-Experte | Übung 1 abgeschlossen |
| 🛒 IKEA-Kenner | Übung 2 abgeschlossen |
| ☕ Starbucks-Stratege | Übung 3 abgeschlossen |
| 🎓 Marketing-Meister | Alle 3 Übungen abgeschlossen |

---

## Daten & Datenschutz

- **Keine Server-Verbindung** erforderlich
- Alle Daten werden im **Browser (localStorage)** gespeichert
- Daten werden **nicht automatisch übertragen** – nur wenn Studierende denselben Browser/Computer verwenden wie die Lehrperson (lokaler Modus)
- Für echte Echtzeit-Synchronisation wäre eine Firebase-Integration notwendig (optional, nicht im Basis-Setup enthalten)

---

## Technische Anforderungen

- Moderner Browser (Chrome, Firefox, Safari, Edge)
- JavaScript aktiviert
- Keine Installation notwendig
- Funktioniert offline nach dem ersten Laden

---

## Häufige Fragen

**F: Die Seite zeigt 404.**  
A: Warte 2–3 Minuten nach dem Aktivieren von GitHub Pages und lade die Seite neu.

**F: Antworten verschwinden nach dem Neustart.**  
A: Antworten werden im Browser gespeichert. Bei gelöschtem Browser-Cache oder privatem Modus gehen sie verloren. Exportiere deine Ergebnisse am Ende der Sitzung.

**F: Studierende erscheinen nicht im Teacher Dashboard.**  
A: Das Teacher Dashboard zeigt Studierende nur, wenn sie denselben Sitzungscode eingegeben haben und sich auf demselben Gerät/Browser befinden (localStorage-Modus). Für sitzungsübergreifende Synchronisation ist Firebase nötig.

**F: Wie reset ich die Sitzung?**  
A: Im Teacher Dashboard auf **Neue Sitzung** klicken. Alternativ im Browser: F12 → Application → Local Storage → Einträge löschen.
