# Release checklist

1. Re-run the requests you changed and record the date in `SKILL.md` and `data/catalogue.json` (`lastTested`).
2. Keep each source's documentation link identical in both files. `npm test` checks this.
3. If an example's numbers changed, run its script without `--offline`, save a new snapshot and update the README figures. Never edit a snapshot by hand.
4. Bump the version in `SKILL.md`, `package.json` and `data/catalogue.json`.
5. Run `npm test` and `npm run build`. Check that `dist/SKILL.md` matches the root file and that `SHA256SUMS.txt` was written.
6. Open the built site at phone width and check the sources grid and the map example.
7. Push to `main`. The Pages workflow tests, builds and publishes the site.
