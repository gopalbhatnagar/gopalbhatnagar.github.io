# Gopal Bhatnagar — Slot Game Developer Portfolio

Static portfolio website based on the supplied resume.

## Run locally

Open `index.html` in a browser, or run a local server:

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080.

## Before publishing
- Replace the placeholder “Add live demo” links with real playable game URLs.
- Add GitHub / LinkedIn links if desired.
- Optionally add screenshots or short videos of actual slot games.
- The resume PDF is included as `Gopal_Bhatnagar_Resume.pdf`.

## GitHub Pages deployment
This repository includes a GitHub Actions workflow at `.github/workflows/deploy-pages.yml` that builds the embedded Vite game and publishes the site to GitHub Pages.

To activate it in GitHub:
1. Push this repo to GitHub.
2. Open the repository settings.
3. Go to Pages.
4. Set the source to “GitHub Actions”.
5. The workflow will deploy automatically on pushes to `main` or `master`.
