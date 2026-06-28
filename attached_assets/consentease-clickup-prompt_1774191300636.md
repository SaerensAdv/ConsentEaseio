# ClickUp Integratie — ConsentEase

Dit document bevat alle informatie die je nodig hebt om vanuit dit Replit-project te communiceren met de ClickUp workspace van Saerens Advertising. De ClickUp Space "ConsentEase" is specifiek ingericht voor dit project en bevat folders voor productontwikkeling (feature areas, bugs, releases) en klantbeheer (klanten, support tickets, feedback, aanvragen). Alle relevante Space-, Folder- en List-IDs staan hieronder zodat je direct API-calls kunt maken zonder eerst de structuur op te hoeven zoeken. De structuur is een vertrekpunt — pas aan waar nodig en werk dit document bij zodat de IDs actueel blijven.

## Connectie

- **ClickUp API v2 Base URL:** `https://api.clickup.com/api/v2`
- **API Key:** Opgeslagen als environment variable `CLICKUP_API_KEY`
- **Team/Workspace ID:** `9015913612`
- **Headers:** `Authorization: {CLICKUP_API_KEY}` + `Content-Type: application/json`

## Beheer van deze Space

Deze Space is een **basisstructuur**. Je mag en moet deze aanpassen naargelang hoe we in dit project gaan werken:

- **Overbodige lijsten/folders verwijderen** als ze niet relevant blijken
- **Nieuwe lijsten/folders toevoegen** als er iets mist
- **Statussen aanpassen** per lijst als de workflow dat vereist
- **Custom fields toevoegen** waar nodig (bijv. op de Klanten lijst: plan type, MRR, domein, etc.)

Werk altijd via de API zodat dit document kan worden bijgewerkt met de nieuwe IDs.

## Space: ConsentEase

- **Space ID:** `90159033137`

### Structuur & IDs

```
📁 Klanten & Support (Folder ID: 901514676336)
│
├── 📋 Customer (List ID: 901522165599, 9 bestaande klanten)
│   Statuses: not started → in progress → active → inactive → complete
│   Bestaande klanten: More Online, Ebify, Saerens Advertising,
│   Webhostplus, ID Advertising, SIX agency, Get Lead,
│   Marketing Boutique, This is Lisbon
│
├── 📋 Support Tickets (List ID: 901522317206)
│   Statuses: to do → complete
│   Gebruik voor: klant support verzoeken, technische problemen,
│   vragen over het platform
│
├── 📋 Feedback & Feature Requests (List ID: 901522317207)
│   Statuses: to do → complete
│   Gebruik voor: klant feedback, feature verzoeken, verbeterideeën
│
└── 📋 Aanvragen & Inschrijvingen (List ID: 901522317209)
    Statuses: to do → complete
    Gebruik voor: nieuwe aanmeldingen, demo-aanvragen, trial inschrijvingen


📁 Product Development (Folder ID: 901512713527)
│
├── 📋 Public Pages (List ID: 901519162869, 14 taken)
├── 📋 Dashboard Features (List ID: 901519162873, 14 taken)
├── 📋 Authenticatie & Beveiliging (List ID: 901519162876, 8 taken)
├── 📋 Stripe & Billing (List ID: 901519162880, 7 taken)
├── 📋 Analytics & Rapportage (List ID: 901519162883, 7 taken)
├── 📋 Technische Verbeteringen (List ID: 901519162890, 8 taken)
├── 📋 Compliance & Features (List ID: 901519162892, 7 taken)
├── 📋 Groei & Integraties (List ID: 901519162895, 8 taken)
├── 📋 UX Verbeteringen (List ID: 901519162897, 6 taken)
├── 📋 Business & Marketing (List ID: 901519162899, 5 taken)
├── 📋 Bugs (List ID: 901522317210)
└── 📋 Releases & Changelog (List ID: 901522317211)
    Alle lijsten status flow: to do → doing → waiting → ready to publish → done → complete
```

## Veelgebruikte API Endpoints

### Taken

```
GET    /list/{list_id}/task                  — Alle taken in een lijst
POST   /list/{list_id}/task                  — Taak aanmaken
GET    /task/{task_id}                       — Taak ophalen
PUT    /task/{task_id}                       — Taak updaten
DELETE /task/{task_id}                       — Taak verwijderen
```

### Checklists

```
POST   /task/{task_id}/checklist             — Checklist aanmaken
POST   /checklist/{checklist_id}/checklist_item — Item toevoegen
PUT    /checklist/{checklist_id}/checklist_item/{item_id} — Item updaten
DELETE /checklist/{checklist_id}/checklist_item/{item_id} — Item verwijderen
```

### Comments

```
GET    /task/{task_id}/comment               — Comments ophalen
POST   /task/{task_id}/comment               — Comment toevoegen
```

### Custom Fields

```
POST   /task/{task_id}/field/{field_id}      — Custom field waarde instellen
```

### Lijsten & Folders

```
GET    /space/{space_id}/folder              — Alle folders
GET    /folder/{folder_id}/list              — Lijsten in folder
GET    /space/{space_id}/list                — Folderless lijsten
```

## Richtlijnen

1. **Nieuwe klant toevoegen:** POST naar Customer lijst (901522165599), status "not started"
2. **Support ticket aanmaken:** POST naar Support Tickets (901522317206)
3. **Bug loggen:** POST naar Bugs (901522317210)
4. **Feature request:** POST naar Feedback & Feature Requests (901522317207)
5. **Nieuwe aanmelding/demo:** POST naar Aanvragen & Inschrijvingen (901522317209)
6. **Release loggen:** POST naar Releases & Changelog (901522317211)
7. **Development taak:** POST naar de relevante Product Development lijst op basis van feature area

## Taak Aanmaken — Voorbeeld

```json
POST /list/{list_id}/task
{
  "name": "Taaknaam",
  "description": "Beschrijving",
  "status": "to do",
  "priority": 3,
  "tags": ["tag1"],
  "due_date": 1711324800000,
  "time_estimate": 3600000
}
```

Priority: 1 = urgent, 2 = high, 3 = normal, 4 = low

## API Beperkingen

- Rate limit: 100 requests per minuut per token
- Recurring taken kunnen NIET via de API worden ingesteld
- Custom fields op list-level worden niet geretourneerd via het list endpoint — gebruik task-level queries
- `time_estimate` is in milliseconden (1 uur = 3600000)
