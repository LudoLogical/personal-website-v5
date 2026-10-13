# Organization logos (resume page)

Every entry on `/resume` (Experience, Education, Certifications, Honors) shows its organization's logo, set as `logo: "/logos/<slug>.png"` on an `Organization` in `src/app/resume/content.tsx`. `OrgLogo` in `src/app/resume/page.tsx` masks it to a squircle (daisyUI `mask-squircle`) and displays it at 40–48px. If an organization has no logo, omit `logo`; its initials are shown instead.

## The spec

So that the set looks uniform (all squircles, all colorful), every file in `public/logos/` is:

- A **256×256 RGB PNG** (no alpha), named `<kebab-case-slug>.png`.
- **Full-bleed**: the background fills the whole square, since the squircle mask clips the corners. Use the organization's own icon background if it has one. Otherwise, center the mark on white, or on a brand color sampled from the organization's own materials.
- **Exactly centered**: equal left/right and top/bottom margins around the mark's bounding box, verified by measuring.

## Sourcing (in order of preference)

1. **A file from the user.** Always ask first or check `public/logos/` for drops; the user can sometimes get higher-resolution or official files.
2. **The organization's apple-touch-icon.** It's square, opaque, and designed to be masked to a squircle, so it's usually the best fit. Fetch the homepage with a browser User-Agent and grep its `<head>` for `rel="apple-touch-icon"`, `apple-touch-icon-precomposed`, or `msapplication-TileImage`. Take the largest size listed. A bare `/apple-touch-icon.png` often 404s, so use the URL the HTML gives.
3. **The organization's GitHub avatar:** `https://github.com/<org>.png?size=256`. Verify the account really belongs to the organization (`github.com/cmu`, for example, is a cartoon car, not Carnegie Mellon).
4. **Wikipedia.** Query the article's images, then fetch a large thumbnail of the chosen file, as below. Free logos are on Commons, while non-free ones (most corporate logos and university seals) are only on `en.wikipedia.org`, so query both. Send a descriptive User-Agent and wait 2–3s between calls, since rapid calls get rate-limited (non-JSON responses).
   ```
   https://en.wikipedia.org/w/api.php?action=query&titles=<Article>&prop=pageimages|images&piprop=original&imlimit=50&format=json&redirects=1
   https://{commons.wikimedia|en.wikipedia}.org/w/api.php?action=query&titles=File:<Name>&prop=imageinfo&iiprop=url&iiurlwidth=960&format=json   # → imageinfo[0].thumburl
   ```
5. **Other places:** the logo in the organization's site header (often an SVG), or an `img/` folder in a related public repo.

Make sure the mark is the organization's own logo, not that of a program or product it runs. For example, the NMSC tile first used the National Merit _Program_'s "M" lettermark by mistake; the right mark was the Corporation's "lamp of learning". When you deliver a new logo, tell the user where each one came from.

Some sites block scripted requests with a 403, a 429, or a bot-check redirect (e.g., `codeday.org`, `nationalmerit.org`, `cde.ca.gov`). That doesn't mean the URL is wrong, so you can still link to it. A domain that only redirects to something like `/lander` is parked; don't link to it (note why in `content.tsx` instead).

## Processing

Treat downloads as untrusted. Save each source in its own new, empty directory in the scratchpad, look at every image (with the Read tool) before using it, and run Python with `-I`. The system Python has no Pillow, so create a venv in the scratchpad (`python3 -m venv <dir>/venv && <dir>/venv/bin/pip install pillow`). The scratchpad can be wiped between turns, so recreate it if it's missing.

1. **Rasterize SVGs** with headless Chrome at 1024px or more, on a transparent background. Load the SVG through a tiny HTML page with an `<img>` sized to the output:
   `google-chrome --headless=new --no-sandbox --disable-gpu --hide-scrollbars --default-background-color=00000000 --window-size=1024,1024 --screenshot=out.png file:///path/page.html`
2. **Inspect** each source: its size, whether its corners are opaque, and the bounding box of the mark. For a transparent image, that's the alpha channel's `getbbox()`; for an opaque one, it's the `getbbox()` of `ImageChops.difference(im, solid_bg_color)` thresholded at 16–48.
3. **Build the tile**, depending on the source:
   - **Already square and full-bleed** (most apple-touch-icons, avatars, and user files): flatten any alpha onto white, then `resize((256, 256), Image.LANCZOS)`.
   - **A mark on a transparent or plain background:** crop to the bounding box plus an equal pad on every side, scale it so that its longer side is `scale × 256`, and paste it centered on the background color. Scales that have worked: about 0.84 for wide wordmarks and seals, 0.72–0.78 for marks, and 0.6 for a single letter.
   - **A colored circle on transparency** (e.g., Coursera's): use the circle's own color as the background so that it becomes full-bleed.
   - **Off-center source:** measure the bounding box and re-center it exactly in Pillow. Don't "fix" a JPEG with lossless editors, since they can only shift in 8px blocks. If the user framed the logo deliberately (e.g., a 1088px square), keep that framing and only fix the centering.
   - **Brand color:** sample it as the most common opaque color of the organization's own icon, or of its site's CSS (e.g., `grep -oiE '#[0-9a-f]{6}' theme.css | sort | uniq -c | sort -rn`).
   ```python
   im = Image.open(src).convert("RGBA")
   im = im.crop(box_with_equal_padding)
   ratio = 256 * scale / max(im.size)
   im = im.resize((round(im.width * ratio), round(im.height * ratio)), Image.LANCZOS)
   tile = Image.new("RGBA", (256, 256), bg + (255,))
   tile.alpha_composite(im, ((256 - im.width) // 2, (256 - im.height) // 2))
   tile.convert("RGB").save(out, optimize=True)
   ```
4. **Verify.** Re-measure the tile's margins: left must equal right, and top must equal bottom. Then render a preview at 96px on the page background (`#1d232a`), masked with a superellipse (`|x|⁴ + |y|⁴ ≤ 1`), next to a few existing tiles, and look at it.
5. **Install.** Copy the tile to `public/logos/<slug>.png`, overwriting the old one. If the format or name changed (e.g., a user's `.svg` or `.jpg` became a `.png`), update the path in `content.tsx`, delete the superseded file, and check that every `logo:` path exists. To check it in the running page, note that Next `Image` lazy-loads, so a blank tile in a screenshot is usually just an image that hasn't loaded yet. Confirm with `img.complete` and `naturalWidth` before assuming it's broken.

## Current provenance

| File                       | Source and treatment                                                                                                                        |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `codeday.png`              | User's SVG, rasterized at 1024px and downsampled                                                                                            |
| `nsr.png`                  | User's 800×832 JPEG, centered exactly in a 1088px white square (the user's framing), then downsampled                                       |
| `nebula-labs.png`          | User's 1000px PNG, downsampled                                                                                                              |
| `cmu.png`                  | User's 600px PNG (wordmark on Carnegie Red), downsampled                                                                                    |
| `cvent.png`, `onfleet.png` | Each site's apple-touch-icon, downsampled                                                                                                   |
| `ut-dallas.png`            | utdallas.edu's apple-touch-icon (orange "UTD" on opaque white), downsampled                                                                 |
| `coursera.png`             | coursera.org's 180px apple-touch-icon (circle on transparency), on `#0056d2`                                                                |
| `peoplesv.png`             | `img/logo.jpg` from `github.com/anke-hao/PeopleSV`, cropped, scale 0.84, on white                                                           |
| `california.png`           | Commons `Seal_of_California.svg`, scale 0.84, on white                                                                                      |
| `homestead.png`            | The white mustang SVG from the hhs.fuhsd.org header, rasterized, scale 0.78, on `#8b0e05` (the most common color in the school's theme CSS) |
| `national-merit.png`       | en.wikipedia `National_Merit_Scholarship_Corporation_logo.svg` (the lamp of learning) at 960px, scale 0.74, on white                        |
