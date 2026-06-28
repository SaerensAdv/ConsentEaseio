# ClickUp Super Agents — ConsentEase Configuratie

Dit document beschrijft de aanbevolen Super Agents voor de ConsentEase ClickUp workspace. Super Agents worden manueel aangemaakt in de ClickUp interface (AI > New Super Agent).

---

## Agent 1: Customer Onboarding Agent

**Doel:** Elke nieuwe klant automatisch onboarden met een checklist en welkomstbericht.

**Trigger:** Nieuwe taak aangemaakt in Customer lijst (List ID: `901522165599`)

**Instructies voor de agent:**

> Wanneer een nieuwe klant-taak wordt aangemaakt in de Customer lijst:
>
> 1. Maak een checklist aan genaamd "Onboarding Checklist" met de volgende items:
>    - [ ] Account verificatie (email bevestigd)
>    - [ ] Eerste website toegevoegd
>    - [ ] Banner geconfigureerd (kleuren, tekst, positie)
>    - [ ] Cookie scan uitgevoerd
>    - [ ] Embed code geïnstalleerd op website
>    - [ ] Banner live & werkend
>    - [ ] Eerste consent logs ontvangen
> 2. Plaats een comment:
>    "🎉 Welkom als nieuwe ConsentEase klant! Dit is het onboarding-overzicht. Zodra alle stappen zijn afgevinkt, wordt de klant als 'active' gemarkeerd."
> 3. Verplaats de status van "not started" naar "in progress"
> 4. Stel de prioriteit in op "normal" (3)

**Kennisbronnen:**
- Customer lijst (Klanten & Support folder)
- ConsentEase documentatie en setup-instructies

**Permissies:** Toegang tot de Klanten & Support folder

---

## Agent 2: Support Triage Agent

**Doel:** Inkomende support tickets automatisch categoriseren, prioriteren en waar mogelijk een eerste antwoord geven.

**Trigger:** Nieuwe taak aangemaakt in Support Tickets lijst (List ID: `901522317206`)

**Instructies voor de agent:**

> Wanneer een nieuw support ticket binnenkomt:
>
> 1. **Analyseer de inhoud** en bepaal de categorie:
>    - `technical` — Problemen met de banner, script, scanning, of integratie
>    - `billing` — Vragen over facturen, abonnementen, upgrades, of betaling
>    - `setup` — Hulp bij installatie, configuratie, of eerste gebruik
>    - `account` — Login problemen, wachtwoord reset, email wijziging
>    - `general` — Overige vragen
>
> 2. **Stel de prioriteit in** op basis van impact:
>    - **Urgent (1):** Website down, banner werkt niet in productie, betaling mislukt
>    - **High (2):** Scan fouten, data niet correct, compliance bezorgdheden
>    - **Normal (3):** Setup vragen, feature vragen, hoe-werkt-het
>    - **Low (4):** Algemene feedback, suggesties, cosmetische issues
>
> 3. **Voeg tags toe:** de categorie-tag (bijv. "technical", "billing") en "triaged"
>
> 4. **Plaats een eerste reactie als comment** als het een veelgestelde vraag betreft:
>    - "Hoe installeer ik het script?" → Verwijs naar de embed code pagina in het dashboard
>    - "Mijn banner verschijnt niet" → Suggereer om de Diagnostics tool te gebruiken
>    - "Hoe annuleer ik mijn abonnement?" → Verwijs naar Settings > Billing in het dashboard
>    - "Hoe wijzig ik mijn plan?" → Verwijs naar Settings > Plan in het dashboard
>    - Voor andere vragen: "Bedankt voor je bericht. Een teamlid bekijkt dit zo snel mogelijk."
>
> 5. Als het ticket het woord "urgent", "down", "broken", of "niet werkend" bevat, stel prioriteit in op Urgent (1)

**Kennisbronnen:**
- ConsentEase documentatie (FAQ, setup guides, troubleshooting)
- Support Tickets lijst (voor context van eerdere tickets)
- Customer lijst (om klantinformatie op te zoeken)

**Permissies:** Toegang tot Klanten & Support folder

---

## Agent 3: Feedback & Feature Request Organizer

**Doel:** Binnenkomende feedback automatisch categoriseren, duplicaten herkennen, en linken aan bestaande development taken.

**Trigger:** Nieuwe taak aangemaakt in Feedback & Feature Requests lijst (List ID: `901522317207`)

**Instructies voor de agent:**

> Wanneer nieuwe feedback of een feature request binnenkomt:
>
> 1. **Categoriseer** met een tag op basis van het onderwerp:
>    - `ui-ux` — Interface, design, gebruiksvriendelijkheid
>    - `compliance` — GDPR, CCPA, regelgeving, juridisch
>    - `billing` — Prijzen, plannen, facturatie
>    - `performance` — Snelheid, laadtijden, stabiliteit
>    - `integration` — Platforms, third-party tools, API
>    - `analytics` — Rapportage, statistieken, dashboards
>    - `scanner` — Cookie scanning, detectie, classificatie
>    - `banner` — Banner design, gedrag, configuratie
>
> 2. **Zoek naar duplicaten:** Doorzoek bestaande taken in de Feedback lijst EN de Product Development folder op gelijkaardige titels of onderwerpen. Als er een vergelijkbare taak bestaat, plaats een comment: "📎 Mogelijk gerelateerd aan: [taaknaam] in [lijstnaam]"
>
> 3. **Beoordeel de impact:**
>    - Als meerdere klanten hetzelfde vragen → prioriteit High (2), tag "popular"
>    - Als het een quick win is (kleine moeite, grote waarde) → tag "quick-win"
>    - Als het een grote feature betreft → tag "epic"
>
> 4. Voeg de tag "organized" toe om aan te geven dat de agent het heeft verwerkt

**Kennisbronnen:**
- Feedback & Feature Requests lijst
- Alle lijsten in Product Development folder (List IDs: 901519162869 t/m 901519162899)
- Customer lijst (om klantcontext te begrijpen)

**Permissies:** Leestoegang tot alle lijsten in de ConsentEase space

---

## Agent 4: Weekly Report Agent

**Doel:** Elke maandag een samenvattingsrapport genereren met key metrics van de afgelopen week.

**Trigger:** Gepland — Elke maandag om 09:00 CET

**Instructies voor de agent:**

> Genereer een wekelijks rapport en post het als een bericht in ClickUp Chat (of als een Doc). Het rapport bevat:
>
> ### 📊 ConsentEase — Weekrapport [datum]
>
> **Nieuwe Klanten**
> - Aantal nieuwe klant-taken aangemaakt in de Customer lijst deze week
> - Lijst met namen/domeinen van nieuwe klanten
>
> **Support Tickets**
> - Totaal aantal openstaande tickets (status: "to do")
> - Aantal tickets aangemaakt deze week
> - Verdeling per prioriteit (urgent/high/normal/low)
> - Gemiddelde tijd van aanmaak tot "complete" (indien beschikbaar)
>
> **Feedback & Feature Requests**
> - Aantal nieuwe feedback items deze week
> - Meest voorkomende thema's/tags
> - Populaire requests (tag "popular")
>
> **Product Development**
> - Taken verplaatst naar "done" of "complete" deze week
> - Taken momenteel "doing"
> - Eventuele blokkades of taken met status "waiting"
>
> **Aanvragen & Leads**
> - Aantal nieuwe items in Aanvragen & Inschrijvingen deze week
> - Scan leads (tag "public-scan") vs. directe aanmeldingen
>
> ### Aanbevelingen
> - Als er tickets > 48 uur open staan: vermeld deze expliciet
> - Als er populaire feature requests zijn: highlight de top 3
> - Als er bugs zijn met prioriteit urgent/high: vermeld deze

**Kennisbronnen:**
- Alle lijsten in Klanten & Support folder
- Alle lijsten in Product Development folder
- Bugs lijst
- Releases & Changelog lijst

**Permissies:** Leestoegang tot de volledige ConsentEase space

---

## Hoe aan te maken

1. Open ClickUp → klik op **AI** in de globale navigatie
2. Klik op **New Super Agent**
3. Beschrijf de agent in gewone taal (kopieer de "Instructies voor de agent" sectie hierboven)
4. Wanneer ClickUp Brain verduidelijkingsvragen stelt:
   - Koppel de juiste lijsten/folders als kennisbron
   - Stel de trigger in zoals hierboven beschreven
   - Configureer de permissies
5. Review het agent-profiel en activeer

## Vereisten

- ClickUp 4.0 workspace
- AI ClickApp ingeschakeld
- Chat ClickApp ingeschakeld (voor de Weekly Report Agent DM's)
- Voldoende Super Credits op je plan

## Referentie: List IDs

| Lijst | List ID |
|-------|---------|
| Customer | `901522165599` |
| Support Tickets | `901522317206` |
| Feedback & Feature Requests | `901522317207` |
| Aanvragen & Inschrijvingen | `901522317209` |
| Bugs | `901522317210` |
| Releases & Changelog | `901522317211` |
| Public Pages | `901519162869` |
| Dashboard Features | `901519162873` |
| Authenticatie & Beveiliging | `901519162876` |
| Stripe & Billing | `901519162880` |
| Analytics & Rapportage | `901519162883` |
| Technische Verbeteringen | `901519162890` |
| Compliance & Features | `901519162892` |
| Groei & Integraties | `901519162895` |
| UX Verbeteringen | `901519162897` |
| Business & Marketing | `901519162899` |
