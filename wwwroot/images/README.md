# Images

The hero carousel currently uses CSS gradient placeholders (see
`.fan-card__image--studio`, `--crowd`, `--bokeh` in `wwwroot/css/site.css`)
so the page runs without any binary assets.

To use the real photography from Figma:

1. Export the three hero images from the Figma file (right-click layer →
   Export, PNG/JPG, 2x).
2. Drop them in this folder, e.g. `studio.jpg`, `crowd.jpg`, `bokeh.jpg`.
3. In `site.css`, replace each gradient with:
   ```css
   .fan-card__image--studio {
       background-image: url('/images/studio.jpg');
       background-size: cover;
       background-position: center;
   }
   ```
