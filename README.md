# Blog

A simple, static blog — plain HTML files, one shared stylesheet, no build step.

## Structure

```
.
├── index.html          # Home page (list of posts)
├── about.html          # About page
├── experiments.html    # Experiments page (image tiles for games & tools)
├── 404.html            # Not-found page
├── posts/              # One HTML file per post
│   └── hello-world.html
├── css/style.css       # All styling (light + dark)
├── js/theme.js         # Dark mode toggle
├── assets/og/          # Per-page social-share cards (generated)
├── assets/experiments/ # 960x540 tile images for experiments.html
├── scripts/generate-og.mjs  # Builds the social cards
├── CNAME               # Your custom domain (for GitHub Pages)
└── .nojekyll           # Tells GitHub Pages to serve files as-is
```

## Writing a new post

1. Copy `posts/hello-world.html` to `posts/your-post-name.html`.
2. Change the `<title>`, the `<h1>`, the date, and the body text.
3. Add a link to it near the top of the post list in `index.html`:

   ```html
   <li>
     <a href="/posts/your-post-name.html">Your title</a>
     <span class="post-meta">Month DD, YYYY</span>
     <p class="post-excerpt">One-line summary.</p>
   </li>
   ```

4. Generate the social-share card so the post has its own branded preview
   when shared on X, LinkedIn, etc. (uses the post's `og:title` as the
   headline and `og:description` as the subhead):

   ```bash
   node scripts/generate-og.mjs
   ```

   This regenerates `assets/og/<slug>.png` for every page and points each
   page's `og:image` / `twitter:image` at its own card. Requires
   `rsvg-convert` (install once with `brew install librsvg`). To rebuild only
   some cards, name the pages:
   `node scripts/generate-og.mjs posts/your-post-name.html`.

5. Save, commit, and push. It's live in a minute.

## Adding an experiment

1. Save a 16:9 image, 960x540 JPEG, as `assets/experiments/<slug>.jpg`. The
   PixelAgora tile is a mosaic of the hub's game art
   ([papagel/games-hub](https://github.com/papagel/games-hub), `assets/thumbs/fix-*.jpg`).
2. Copy one `<li>` in `experiments.html` and change the link, image, title,
   description, and host line.

## Cognitive Bias Explorer (/biases)

`biases/` (English, Greek, animation pages, icons, videos) and `assets/og/biases*.png`,
`assets/og/watch-*.png` are built from a separate repository,
[papagel/cognitive-bias](https://github.com/papagel/cognitive-bias), which lives next to
this one (`~/Apps/cognitive-bias`). Don't edit them here. Change the source there, run
`python3 build.py` (it writes into this repo), then commit and push this blog.

## Preview locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy to GitHub Pages

1. Create a new repository on GitHub.
2. Push this folder:

   ```bash
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```

3. In the repo: **Settings → Pages → Build and deployment**, set
   **Source = Deploy from a branch**, **Branch = `main` / root**, then Save.
4. Put your domain in the `CNAME` file (already scaffolded — replace the
   placeholder), and in **Settings → Pages → Custom domain**.
5. At your domain registrar, point DNS at GitHub Pages:
   - **Apex domain** (`example.com`): four `A` records →
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - **Subdomain** (`blog.example.com`): one `CNAME` record → `<you>.github.io`
6. Wait for DNS, then enable **Enforce HTTPS**.
```
