# Lesson Plan Builder - Setup & Usage

## Overview

The Lesson Plan Builder is a modular system for creating and managing lesson plans at different time scales: Yearly, Monthly, Weekly, and Daily.

## Database Setup

Create the `lesson_plans` collection in PocketBase by running:

```bash
python3 setup-pb.py
```

Or manually add the collection via PocketBase Admin with these fields:

| Field    | Type   | Required |
|----------|--------|----------|
| teacher  | text   | ✓        |
| class_id | text   | ✓        |
| period   | text   | ✓        |
| title    | text   |          |
| date     | text   |          |
| data     | json   |          |

## Accessing the Lesson Planner

1. Log in as a teacher
2. From the portal, click **Lesson Planner** (green button next to Play Games)
3. Or navigate directly to `#lesson-planner`

## Features

- **Period selector**: Yearly / Monthly / Weekly / Daily
- **Class selector**: Dropdown from your classes
- **Dynamic templates**: Structure changes based on selected period
- **Fixed structure + editable fields**: Each template has non-editable stages/sections and editable teacher inputs
- **Save / Save as Draft**: Persist to database
- **Auto-save**: Every 30 seconds when editing
- **Load existing**: Dropdown to reopen and edit saved plans
- **Export PDF**: School-friendly formatted PDF
- **Export DOCX**: Word document with headings and tables

## Template Structures

### Daily
- Fixed: Engage, Explore, Explain, Elaborate, Evaluate (5E stages)
- Editable: Objective, Materials, Teacher Actions, Student Actions, Assessment per stage, Notes

### Weekly
- Fixed: Day → 5E Stage mapping (Mon–Fri)
- Editable: Focus, Language Target, Assessment, Notes

### Monthly
- Fixed: 5E phases
- Editable: Focus, Teacher Role, Student Outcome, Assessment, Skill Map, Notes

### Yearly
- Fixed sections: Desired Results, Assessment Evidence, Unit Overview Table
- Editable: All content fields, Notes

## File Structure

```
src/
├── templates/
│   └── lessonTemplates.ts   # Centralized config (add custom templates here)
├── components/lesson-planner/
│   ├── LessonPlannerPage.jsx
│   ├── DailyTemplate.jsx
│   ├── WeeklyTemplate.jsx
│   ├── MonthlyTemplate.jsx
│   └── YearlyTemplate.jsx
├── utils/
│   └── lessonPlanExport.js  # PDF & DOCX export
└── services/
    └── api.js               # getLessonPlans, createLessonPlan, updateLessonPlan, deleteLessonPlan
```

## API Endpoints (PocketBase)

- `GET /collections/lesson_plans/records` — List (filtered by teacher client-side)
- `GET /collections/lesson_plans/records/:id` — Get one
- `POST /collections/lesson_plans/records` — Create
- `PATCH /collections/lesson_plans/records/:id` — Update
- `DELETE /collections/lesson_plans/records/:id` — Delete

## Security

- Requires authentication (token in Authorization header)
- Filter plans by teacher email on fetch
- Input sanitization in export (strip HTML, limit length)
