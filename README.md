# Healthy Life — Node.js + Vercel

PMV web de Healthy Life preparado para ejecutarse localmente con Node.js y desplegarse directamente en Vercel.

## Requisitos

- Node.js 20 o superior.
- No requiere `npm install`: no tiene dependencias externas.

## Ejecutar en tu PC

1. Descomprime la carpeta.
2. Abre una terminal dentro de `healthy-life-vercel-v2`.
3. Ejecuta:

```bash
npm run dev
```

4. Abre:

```text
http://localhost:3000
```

5. Para comprobar que Node funciona:

```text
http://localhost:3000/api/health
```

Debe responder JSON con `"ok": true`.

## Desplegar en Vercel

### Opción recomendada: GitHub

1. Crea un repositorio nuevo en GitHub.
2. Sube **el contenido de esta carpeta** a la raíz del repositorio. Es importante que `index.html`, `api/`, `assets/`, `package.json` y `vercel.json` queden en la raíz.
3. En Vercel: **Add New → Project**.
4. Importa el repositorio.
5. Framework Preset: **Other**.
6. No configures Build Command ni Output Directory.
7. Pulsa **Deploy**.

Vercel servirá el sitio estático y reconocerá automáticamente `api/plan.js` como función Node.js.

## Estructura

```text
healthy-life-vercel-v2/
├── api/
│   └── plan.js          # función Node.js para Vercel
├── lib/
│   └── plan.js          # motor de microhábitos compartido
├── assets/
│   ├── logo.png
│   ├── app-mockup.png
│   ├── starter-kit.png
│   └── poster.png
├── index.html
├── styles.css
├── script.js
├── server.js            # servidor Node local
├── package.json
├── vercel.json
└── README.md
```

## API

`POST /api/plan`

Ejemplo de body:

```json
{
  "goal": "equilibrio",
  "time": 10,
  "energy": "media"
}
```

Valores de `goal`: `equilibrio`, `energia`, `movimiento`, `alimentacion`, `bienestar`.

Valores de `energy`: `baja`, `media`, `alta`.

## Nota del PMV

Healthy Life promueve hábitos generales de bienestar y no reemplaza atención médica, nutricional o psicológica profesional.
