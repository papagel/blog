# Blog

A simple, static blog — plain HTML files, one shared stylesheet, no build step.

## Structure

```
.
├── index.html          # Home page (list of posts)
├── about.html          # About page
├── 404.html            # Not-found page
├── posts/              # One HTML file per post
│   └── hello-world.html
├── css/style.css       # All styling (light + dark)
├── js/theme.js         # Dark mode toggle
├── assets/og/          # Per-page social-share cards (generated)
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
   `rsvg-convert` (install once with `brew install librsvg`).

5. Save, commit, and push. It's live in a minute.

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
