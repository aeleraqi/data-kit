# A 2025 figure from a 2021 survey

> كم نسبة الفقر المدقع في مصر الآن؟
> What share of Egyptians live in extreme poverty now?

Our World in Data's extreme-poverty map shows Egypt at **1.37% in 2025**. Egypt didn't run a household survey in 2025. The figure comes from the 2021 HIECS survey and has been carried forward to fill the map.

## What came back on 11 October 2026

| Source | Year shown | Year measured | Share below $3 a day (2021 PPP) |
| --- | --- | --- | ---: |
| Our World in Data | 2025 | 2021 (`original_year`) | 1.37% |
| World Bank PIP | 2021 | 2021 | 1.37% (consumption) |

The `original_year` column gives it away. PIP, the source behind the chart, has the same value for the 2021 survey. Morocco has no row on the 2025 map at all; its latest survey is too old to carry forward.

**For a story:** "1.37% of Egyptians lived below $3 a day in 2021, the latest survey available (World Bank)". Not "in 2025". PIP measures consumption for Egypt, so don't compare it with a country that reports income.

## Run it

```sh
node examples/poverty-carried-forward/check.mjs            # live
node examples/poverty-carried-forward/check.mjs --offline  # saved snapshot
node --test examples/poverty-carried-forward/
```

Requests:

- Our World in Data: `https://ourworldindata.org/grapher/share-of-population-in-extreme-poverty.csv?country=EGY~MAR&csvType=filtered&useColumnShortNames=true`
- PIP: `https://api.worldbank.org/pip/v1/pip?country=EGY&year=all&povline=3&ppp_version=2021&format=json`

The `country` filter in the first request doesn't narrow the rows; the filtered download returns the map year for every country, so the script picks Egypt and Morocco itself.
