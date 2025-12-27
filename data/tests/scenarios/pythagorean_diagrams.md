# Test Scenario: Pythagorean Diagrams (ADR-021)

## Purpose
Verify that all Pythagorean theorem questions display a right triangle diagram with the correct side highlighted.

## Prerequisites
- App running on localhost:5173 or deployed to GitHub Pages
- Puppeteer MCP configured with `protocolTimeout: 60000`

## Test Cases

### TC-1: Diagram Presence
**Steps:**
1. Navigate to app
2. Select "Pythagorova věta" topic
3. Start practice session

**Expected:**
- Right triangle SVG diagram is visible
- Triangle has labeled sides (a, b, c)
- Right angle marker visible at corner

### TC-2: Highlight "c" (Hypotenuse)
**Test question:** `a = 3, b = 4, c = ?`

**Expected:**
- Side "c" (diagonal/hypotenuse) is highlighted in purple
- Other sides remain in default gray color

### TC-3: Highlight "a" (Leg)
**Test question:** `Hledám odvěsnu a =`

**Expected:**
- Side "a" (vertical) is highlighted in purple
- Other sides remain in default gray color

### TC-4: Highlight "b" (Leg)
**Test question:** `Hledám odvěsnu b =`

**Expected:**
- Side "b" (horizontal) is highlighted in purple
- Other sides remain in default gray color

## Puppeteer Test Commands

```javascript
// Navigate with extended timeout
await puppeteer_navigate({
  url: "http://localhost:5173/tutor/",
  launchOptions: { protocolTimeout: 60000, headless: true }
});

// Click Pythagorova věta topic
await puppeteer_click({ selector: "text=Pythagorova věta" });

// Skip explanation modal
await puppeteer_click({ selector: "text=Zkusím to" });

// Take screenshot to verify diagram
await puppeteer_screenshot({ name: "pythagorean-diagram", width: 375, height: 667 });

// Verify SVG diagram exists
await puppeteer_evaluate({
  script: `
    const svg = document.querySelector('svg');
    const lines = svg ? svg.querySelectorAll('line').length : 0;
    const labels = svg ? svg.querySelectorAll('text').length : 0;
    JSON.stringify({ hasSvg: !!svg, lines, labels });
  `
});
```

## Verification Checklist

| Check | Expected | Status |
|-------|----------|--------|
| SVG element present | Yes | |
| 3 triangle lines | 3 | |
| 3 side labels (a, b, c) | 3 | |
| Right angle marker | Yes | |
| Highlighted side color | #7c3aed (purple-600) | |
| Default side color | #475569 (slate-600) | |

## Related
- ADR-021: Automatic Geometry Diagrams
- `app/src/components/diagrams/RightTriangleDiagram.tsx`
