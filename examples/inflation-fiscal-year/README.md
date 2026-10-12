# One inflation rate, two kinds of year

> لماذا يختلف تضخم مصر بين البنك الدولي وصندوق النقد؟
> Why does Egypt's inflation differ between the World Bank and the IMF?

Ask two respected sources for Egypt's inflation in 2023 and you get 33.9% and 24.4%. Neither is wrong. They are measuring different twelve months.

## What came back on 11 October 2026

| Country | Year | World Bank | IMF | Gap (points) |
| --- | --- | ---: | ---: | ---: |
| Egypt | 2022 | 13.9 | 8.5 | −5.4 |
| Egypt | 2023 | 33.9 | 24.4 | −9.5 |
| Egypt | 2024 | 28.3 | 33.3 | +5.0 |
| Egypt | 2025 | 14.1 | 20.4 | +6.3 |
| Jordan | 2023 | 2.1 | 2.1 | 0.0 |
| Morocco | 2023 | 6.1 | 6.1 | 0.0 |

Jordan and Morocco match to within 0.1 points every year from 2020 to 2025. Egypt doesn't. The IMF's World Economic Outlook reports Egypt by fiscal year, July to June, so its "2024" is roughly July 2023 to June 2024. The World Bank uses the calendar year. Inflation peaked in 2023 and 2024, so the two windows catch the peak at different points.

**For a story:** say which year you mean. "Inflation averaged 33.9% in calendar 2023 (World Bank)" or "33.3% in fiscal year 2023/24 (IMF)". Don't put the two side by side in one chart.

Check the fiscal-year convention in the WEO country notes before you publish; this example shows the pattern but doesn't quote that note.

## Run it

```sh
node examples/inflation-fiscal-year/compare.mjs            # live
node examples/inflation-fiscal-year/compare.mjs --offline  # saved snapshot
node examples/inflation-fiscal-year/compare.mjs --save     # live, then save a dated snapshot
node --test examples/inflation-fiscal-year/
```

No key or account. The IMF endpoint returns every economy, so the script filters it.

Requests:

- World Bank: `https://api.worldbank.org/v2/country/EGY;JOR;MAR/indicator/FP.CPI.TOTL.ZG?format=json&date=2020:2025&per_page=100`
- IMF: `https://www.imf.org/external/datamapper/api/v1/PCPIPCH`

[snapshot.json](snapshot.json) holds the World Bank response in full and the IMF response trimmed to these three countries.
