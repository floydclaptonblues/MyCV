# N80FP Search Simulation — Recovered Source

This is the recovered source for the specialized N80FP search-sector interface shown in the case-study screenshots.

## Operational role

Ryan used this application after arriving at the Lake Pontchartrain search area to refine the working aircraft model and translate the analysis into a field-usable interface. Development was iterative, moving between ChatGPT-assisted reasoning and Gemini Studio App Builder implementation while the search operation was active.

The application should therefore be understood as an **in-field modeling and coordination tool**: it preserved the working modeled point, visualized the search geometry, incorporated live device position, and supported a consistent marker workflow for crews on the water.

## What the source establishes

- The modeled point of impact is explicitly stored as `30.1038, -90.0309`.
- The last-known-position marker is stored as `30.1100, -90.0300` at approximately 908 feet.
- The Cajun Navy slick/debris report is stored as `30.1103, -90.0254`.
- The app renders a search ellipse, live GPS, a movable boat, a search trail, and standardized `clear`, `debris`, and `crash` markers.
- Marker records include latitude, longitude, type, and timestamp.

## Evidentiary limitation

This recovered application preserves the operational visualization, configured modeled POI, and field workflow. It does not, by itself, reproduce every upstream calculation or conversation that preceded the field deployment, nor does the source archive alone prove when the coordinate was first entered. Those provenance questions are documented separately in the case study.

## Security sanitation

The uploaded archive contained a non-empty `.env.local`. That file was excluded. The app does not use a Gemini API call, so no API credential is required by the archived source.

## Original AI Studio project

The recovered export identifies the AI Studio app as:

`https://ai.studio/apps/c80910d7-e780-4191-832b-39b3cf91e446`
