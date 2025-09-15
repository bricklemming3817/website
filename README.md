# Personal Site (GitHub Pages)

This repo is a lightweight Jekyll site designed for GitHub Pages. The homepage shows your name, a short bio, contact links (Email, GitHub, X), and a grid of projects. Each project has its own page.

## Quick Start

1. Edit `_config.yml` and set:
   - `author_name`
   - `author_bio`
   - `email`
   - `github`
   - `x_handle`

2. Add or edit projects in `_projects/`. Each file is Markdown with front matter. Example:

   ```yaml
   ---
   title: "My Project"
   summary: "One sentence about it."
   tags: [tag1, tag2]
   image: "/path-or-url/to/cover.png"
   image_alt: "Screenshot of My Project"
   order: 1 # lower shows first
   ---

   Long-form details go here.
   ```

3. Commit and push to GitHub.

## Deploy on GitHub Pages

- In GitHub: Settings → Pages → Build and deployment → Source → "Deploy from a branch".
- Select your default branch (e.g. `main`) and `/ (root)`.
- Save. Pages will build and publish at `https://<username>.github.io/<repo>`.

If your site is a project site (repo is not `<username>.github.io`), set `baseurl` in `_config.yml` to `"/<repo>"` (for this repo, `"/website"`). Links in the templates use `relative_url` and will respect `baseurl`.

## Run locally (optional)

You can preview locally with Jekyll (Ruby required):

```bash
gem install bundler
bundle init # if Gemfile not present
echo 'gem "jekyll"' >> Gemfile
bundle install
bundle exec jekyll serve
```

Then visit http://localhost:4000

## Structure

- `index.html` — homepage (name, bio, contacts, projects)
- `_projects/` — collection of project pages
- `_layouts/project.html` — layout for project detail pages
- `_config.yml` — site settings and profile info

