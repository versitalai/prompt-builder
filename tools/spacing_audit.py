# Spacing audit: checks every gap between visible siblings matches the spacing scale.
# Needs: pip install playwright && playwright install chromium
# Run:   python3 tools/spacing_audit.py .   (prints mismatches; 0 = even)
import subprocess, time, sys, json
from playwright.sync_api import sync_playwright
ROOT = sys.argv[1]
srv = subprocess.Popen(["python3", "-m", "http.server", "8767", "-d", ROOT], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)

# Expected vertical gap between consecutive visible children, per container.
EXPECT = {
  ".panel": 24, ".page-head": 4, ".card": 16, ".field:not(.field-list)": 8, ".field-list": 16, ".list-item": 16,
  ".toggle-text": 4, ".checks": 12, ".summary-actions": 8, ".col-side": 24, ".alert > div": 4,
  ".card-head > div": 4, ".tip-card > div": 4, ".summary-stats > div": 4,
}
JS = """(expect) => {
  const out = [];
  for (const [sel, want] of Object.entries(expect)) {
    document.querySelectorAll(sel).forEach((c) => {
      if (!c.offsetParent && getComputedStyle(c).position !== 'fixed') return;
      const kids = [...c.children].filter((k) => k.offsetParent && k.getBoundingClientRect().height > 0);
      for (let i = 1; i < kids.length; i++) {
        const a = kids[i-1].getBoundingClientRect(), b = kids[i].getBoundingClientRect();
        if (Math.abs(b.top - a.top) < 2) continue; // same row (side by side)
        const gap = Math.round(b.top - a.bottom);
        if (gap !== want) out.push({sel, want, gap, a: kids[i-1].className || kids[i-1].tagName, b: kids[i].className || kids[i].tagName});
      }
    });
  }
  return out;
}"""
bad = []
try:
    with sync_playwright() as p:
        b = p.chromium.launch()
        for name, vp in [("desktop", {"width": 1366, "height": 900}), ("mobile", {"width": 390, "height": 844})]:
            pg = b.new_page(viewport=vp)
            pg.add_init_script("document.documentElement.style.setProperty('--no-anim','1')")
            pg.goto("http://localhost:8767/")
            pg.add_style_tag(content="*{animation:none!important;transition:none!important}")
            # turn everything on so all fields render
            pg.click("#tab-examples"); pg.click("#panel-examples .btn-dashed"); pg.click("#panel-examples .btn-dashed")
            pg.click("#tab-advanced")
            for t in ["cot", "tot", "battle"]: pg.check(f"#f-advanced-{t}")
            for tab in ["persona", "task", "context", "format", "examples", "advanced", "preview"]:
                pg.click(f"#tab-{tab}"); time.sleep(0.05)
                for r in pg.evaluate(JS, EXPECT):
                    r["view"], r["tab"] = name, tab
                    bad.append(r)
            pg.close()
        b.close()
finally:
    srv.terminate()
seen = set()
for r in bad:
    k = (r["view"], r["sel"], r["gap"], r["a"], r["b"])
    if k in seen: continue
    seen.add(k)
    print(f'{r["view"]:7} {r["tab"]:9} {r["sel"]:18} want {r["want"]:>2} got {r["gap"]:>3}  [{r["a"]}] -> [{r["b"]}]')
print("mismatches:", len(seen))
