# Portfolio of Aditya Karale — Platform Engineer

Static single-page portfolio (HTML + CSS + vanilla JS), hosted on GitHub Pages at
[adityakarale.github.io](https://adityakarale.github.io).

## Structure

```
index.html            single page, all sections
style.css             all styles
script.js             nav scroll, mobile menu, typing animation, active-section highlight
assets/resume/        Aditya_Karale_Resume_FINAL.pdf
assets/images/        OCCNXT screenshots (add occnxt-dashboard.png for the share preview)
assets/icons/         favicon
```

## Run locally

Open `index.html` in a browser, or serve the folder:

```
python -m http.server 8000
```

## Deploy

```
git add . && git commit -m "update" && git push
```

GitHub Pages serves the `main` branch root (Settings → Pages → Deploy from branch → `main` / root).
