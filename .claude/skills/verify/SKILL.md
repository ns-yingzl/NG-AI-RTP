---
name: verify
description: Render a prototype route in a real browser and check it — screenshot it for visual review and catch runtime/SSR errors that static docs can't reveal. Use after building or changing a page, before telling the designer it's done.
---

# /verify

`/verify <route>` (e.g. `/verify /tools/traffic-simulator`). Renders the route, captures a screenshot, and surfaces server/console errors.

**Why this exists:** some problems are invisible in component docs and only appear when the page actually runs — e.g. `@netskope-ui/filter`'s `AdvancedFilter` crashes during SSR (`window is not defined`), and pills silently stretch full-width. Reading types/stories can't catch these; rendering can.

## Steps

1. **Ensure the dev server is up.** If nothing is listening on the dev port, start it in the background:
   ```bash
   (yarn dev > "$TMPDIR/dev.log" 2>&1 &) ; until grep -qE "Ready in|Error" "$TMPDIR/dev.log"; do sleep 1; done
   ```
   Default port is 3000. If the route's first compile is slow (filter-heavy pages pull in thousands of modules and can take ~80s), allow a long timeout.

2. **Hit the route and capture the server log** (catches SSR/compile errors). Note: a sandbox may block `localhost` — if `curl` returns `000`, retry the command unsandboxed.
   ```bash
   curl -s -o "$TMPDIR/route.html" -w "%{http_code}" "http://localhost:3000<route>" --max-time 240
   grep -nE "⨯|Error:|TypeError|window is not defined" "$TMPDIR/dev.log"
   ```
   A `500`/`502` with `window is not defined` in the log → the page imports a client-only component at module load; wrap it in `next/dynamic(() => import(...), { ssr: false })`. See `netskope-context/known-issues.md`.

3. **Screenshot with headless Chrome** (then Read the PNG to inspect it):
   ```bash
   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
     --headless=new --disable-gpu --hide-scrollbars \
     --force-device-scale-factor=1 --window-size=1440,1100 \
     --virtual-time-budget=12000 \
     --screenshot="$TMPDIR/verify.png" "http://localhost:3000<route>"
   ```
   If Chrome isn't at that path, try `which chromium` / Edge, or tell the designer to open the route themselves.

4. **Review the screenshot against the design**: component identity, spacing, widths, that nothing renders unstyled or full-width-stretched, and that interactive states look right. Report what you see, with the screenshot.

## Reminders

- Verify the **interactive** branches too (e.g. toggle to a second tab/mode) by temporarily defaulting state to that branch, screenshotting, then reverting.
- If you hit a new runtime gotcha, append it to `netskope-context/known-issues.md` so the next prototype avoids it.
