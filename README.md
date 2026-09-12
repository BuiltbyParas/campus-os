# CampusOS

A student-facing campus platform: attendance, timetable, academics, exams,
fees, campus requests and events in one place, with an assistant that answers
from the student's own records.

**Live:** https://builtbyparas.github.io/campus-os/

> Every figure in the deployed build is **demo data**. The app says so in a
> banner and labels derived numbers with a demo tag — it does not present
> anything as an official institutional record.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check, build to dist/, write the SPA fallback
npm run preview  # serve the production build
npm run lint
```

The app talks to `/api` and falls back to local demo data on any failure — no
backend, a 500, a timeout — so it always renders.

## Deployment

The site is served by GitHub Pages from the `gh-pages` branch at
`/campus-os/`, which is why `vite.config.ts` sets that base for builds and the
router takes it as its basename. `dist/404.html` is a copy of `index.html`:
GitHub Pages serves it for any unknown path, which is what lets a deep link
such as `/campus-os/app/attendance` reach the router instead of a GitHub 404.

To publish the current working tree:

```bash
npm run build
git worktree add --detach /tmp/ghp && cd /tmp/ghp
git checkout gh-pages
rm -rf assets && cp -r /path/to/campus-os/dist/. . && touch .nojekyll
git add -A && git commit -m "Publish the built site" && git push origin gh-pages
```

`.github/workflows/deploy.yml` does the same thing automatically on every push
to `main`. It is not the active source yet — switching Pages from the
`gh-pages` branch to "GitHub Actions" in **Settings → Pages** turns it on once
this work reaches `main`.
