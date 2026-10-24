# SPUTUS preview

SPUTUS is a React single-page web preview built with Vite. It lives beside the existing Qt 6 `ZeroHour` desktop application; that C++ app is unchanged.

## Start

From this directory, install dependencies and start the development server:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`). Create a production build with `npm run build`; serve the resulting `dist/` directory with a static host or CDN. React components and application state are in `src/`.

## Preview limits

This is a front-end prototype, not a production submission platform. It has no server, authentication, database, secure file storage, or email delivery. Writers can enter the competition listed in `src/App.jsx`; there is no organiser interface or public competition creation. The “say it like it is” competition is mock preview data. Profile details and submission metadata are stored in browser `localStorage`; clearing site data removes them. PDF selection checks the filename extension, browser MIME hint, file size, and `%PDF-` header, but does not upload, retain, or fully parse the document. A preview confirmation is not a real competition submission.

Before accepting real entries, implement an authenticated backend with server-side role checks, PDF parsing and size/content validation, private object storage, duplicate protection, transactional submission records, audit history, and organiser notification. Replace the local preview confirmation with a success state returned only after that server transaction commits.
