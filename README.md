# Nanca para GitHub Pages

Sube a la raíz del repositorio únicamente estos archivos y carpetas:

- `.nojekyll`
- `CNAME`
- `index.html`
- `nanca-v16.css`
- `nanca-v16.js`
- `og-residencial.png`
- `assets/`
- `README.md` (solo contiene estas instrucciones)

En GitHub abre `Settings → Pages`, selecciona `Deploy from a branch`, la rama `main` y la carpeta `/ (root)`.

El archivo `CNAME` debe permanecer en la raíz y contener únicamente `nancananca.com`. En `Settings → Pages`, guarda ese mismo dominio como `Custom domain`. Cuando GitHub termine de emitir el certificado, activa `Enforce HTTPS`.

El vídeo se obtiene automáticamente del archivo `.mp4` incluido en el Release `Mar`, tag `Llar`. El nombre recomendado del archivo es `nanca-v1-system-film.mp4`.
