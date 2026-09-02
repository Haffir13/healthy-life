# Healthy Life · Node.js + Vercel

Sitio web funcional para el emprendimiento **Healthy Life**, con una identidad visual orgánica/minimalista y un PMV interactivo de microhábitos.

## Funciones incluidas

- Landing page responsive.
- Identidad visual basada en verdes naturales, sage y crema.
- Secciones: problema, solución, diferenciadores, público objetivo, planes y Starter Kit.
- Demo funcional para generar microhábitos según objetivo, tiempo y nivel de energía.
- Healthy Score interactivo con persistencia local usando `localStorage`.
- API Node.js en `/api/recommend.js`, compatible con Vercel Serverless Functions.
- Servidor local Node.js sin dependencias externas.

## Ejecutar en tu computadora

Requisito: Node.js 20 o superior.

```bash
npm run dev
```

Luego abre:

```text
http://localhost:3000
```

No se necesita `npm install` porque el proyecto no usa dependencias de terceros.

## Publicar en Vercel desde GitHub

1. Crea un repositorio nuevo en GitHub.
2. Sube todos los archivos de este proyecto al repositorio.
3. Entra a Vercel y elige **Add New → Project**.
4. Importa el repositorio.
5. En Framework Preset, selecciona **Other** si Vercel no lo detecta automáticamente.
6. No necesitas Build Command.
7. No necesitas Output Directory.
8. Pulsa **Deploy**.

Vercel servirá los archivos estáticos y la función Node.js `/api/recommend`.

## Estructura

```text
healthy-life-vercel/
├── api/
│   └── recommend.js
├── assets/
│   ├── logo-healthy-life.png
│   ├── healthy-starter-kit.png
│   ├── app-mockup.png
│   └── brand-board.png
├── index.html
├── styles.css
├── script.js
├── server.mjs
├── package.json
├── vercel.json
└── README.md
```

## Nota de producto

La web presenta contenido educativo de bienestar y microhábitos. No debe comunicarse como una herramienta de diagnóstico ni como sustituto de atención médica, nutricional o psicológica profesional.
