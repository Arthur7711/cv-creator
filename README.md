# CV Creator

A CV / résumé builder built with Next.js 16, React 19 and Tailwind CSS 4. Fill in your details in the editor, watch the A4 preview update live, and export a print-quality PDF.

## Features

- **Live A4 preview** that scales to fit your screen.
- **Three templates**: Modern (colored sidebar), Classic (centered header), Minimal (label column).
- **Customization**: accent color presets or any custom color, sans or serif typeface, optional photo and skill-level indicators.
- **Sections**: personal details and summary, work experience, education, skills, projects, languages, links. Reorder or remove entries with one click.
- **Bullet points**: start a description line with `-` to render it as a bullet.
- **PDF export**: vector output with selectable text, via the browser's print dialog.
- **Autosave** to the browser's localStorage, plus JSON import/export for backups.
- Works on phones with an Edit / Preview toggle.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app loads with sample content so you can see each template immediately. Use **Clear** to start from scratch.

## Exporting a PDF

Click **Export PDF**. The browser print dialog opens with the CV already laid out on A4 with zero margins. Choose **Save as PDF** as the destination (Chrome, Edge and Firefox all offer this). Background colors are preserved automatically.

## Project structure

```
app/                  Root layout, global styles and print CSS
components/
  cv-builder.tsx      Page shell: toolbar, editor column, preview column
  toolbar.tsx         Export PDF, JSON import/export, sample and clear actions
  editor/             Form sections for each part of the CV
  preview/            A4 page, the three templates and the scaled preview wrapper
  ui/                 Buttons, inputs and icons
lib/
  cv-types.ts         Data model, defaults and sample content
  use-cv-store.ts     State, localStorage persistence and list helpers
  format.ts           Description parsing, date ranges and URL helpers
```

## Scripts

| Command         | Purpose                     |
| --------------- | --------------------------- |
| `npm run dev`   | Start the development server |
| `npm run build` | Production build            |
| `npm run start` | Serve the production build  |
| `npm run lint`  | Run ESLint                  |
