import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
  useLocation,
} from "@tanstack/react-router";

import Header from "../components/Header";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "CroqueRecettes - Partagez vos recettes",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),

  component: RootDocument,
  notFoundComponent: NotFound,
});

function RootDocument() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");

  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-gray-50">
        {!isDashboard && <Header />}
        <main>
          <Outlet />
        </main>
        <Scripts />
      </body>
    </html>
  );
}

function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-orange-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Page non trouvée
        </h2>
        <p className="text-gray-600 mb-8">
          Oups ! La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Link
          to="/"
          className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
