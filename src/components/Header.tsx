import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  BookOpen,
  Home,
  LogIn,
  LogOut,
  Menu,
  Plus,
  User,
  X,
} from "lucide-react";
import { useSession, signOut } from "../lib/auth-client";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  return (
    <>
      <header className="p-4 flex items-center justify-between bg-orange-600 text-white shadow-lg">
        <div className="flex items-center">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 hover:bg-orange-700 rounded-lg transition-colors md:hidden"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
          <Link to="/" className="ml-2 md:ml-0 flex items-center gap-2">
            <BookOpen size={28} />
            <span className="text-xl font-bold">CroqueRecettes</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="hover:text-orange-200 transition-colors"
            activeProps={{ className: "text-orange-200 font-semibold" }}
          >
            Accueil
          </Link>
          <Link
            to="/recettes"
            className="hover:text-orange-200 transition-colors"
            activeProps={{ className: "text-orange-200 font-semibold" }}
          >
            Recettes
          </Link>
          {session?.user ? (
            <>
              <Link
                to="/recettes/nouvelle"
                className="flex items-center gap-1 bg-white text-orange-600 px-3 py-1.5 rounded-md hover:bg-orange-100 transition-colors"
              >
                <Plus size={18} />
                Nouvelle recette
              </Link>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-700 rounded-md">
                <User size={18} />
                <span className="font-medium">{session.user.name}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1 hover:text-orange-200 transition-colors"
              >
                <LogOut size={18} />
                Déconnexion
              </button>
            </>
          ) : (
            <Link
              to="/auth/login"
              className="flex items-center gap-1 bg-white text-orange-600 px-3 py-1.5 rounded-md hover:bg-orange-100 transition-colors"
            >
              <LogIn size={18} />
              Connexion
            </Link>
          )}
        </nav>
      </header>

      {/* Mobile menu */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-gray-900 text-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BookOpen size={24} />
            Menu
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
            activeProps={{
              className:
                "flex items-center gap-3 p-3 rounded-lg bg-orange-600 hover:bg-orange-700 transition-colors mb-2",
            }}
          >
            <Home size={20} />
            <span className="font-medium">Accueil</span>
          </Link>

          <Link
            to="/recettes"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
            activeProps={{
              className:
                "flex items-center gap-3 p-3 rounded-lg bg-orange-600 hover:bg-orange-700 transition-colors mb-2",
            }}
          >
            <BookOpen size={20} />
            <span className="font-medium">Recettes</span>
          </Link>

          {session?.user ? (
            <>
              <Link
                to="/recettes/nouvelle"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
                activeProps={{
                  className:
                    "flex items-center gap-3 p-3 rounded-lg bg-orange-600 hover:bg-orange-700 transition-colors mb-2",
                }}
              >
                <Plus size={20} />
                <span className="font-medium">Nouvelle recette</span>
              </Link>

              <div className="border-t border-gray-700 mt-4 pt-4">
                <div className="flex items-center gap-3 p-3 text-gray-400">
                  <User size={20} />
                  <span>{session.user.name}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors w-full text-left text-red-400"
                >
                  <LogOut size={20} />
                  <span className="font-medium">Déconnexion</span>
                </button>
              </div>
            </>
          ) : (
            <div className="border-t border-gray-700 mt-4 pt-4">
              <Link
                to="/auth/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
              >
                <LogIn size={20} />
                <span className="font-medium">Connexion</span>
              </Link>
              <Link
                to="/auth/register"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
              >
                <User size={20} />
                <span className="font-medium">Créer un compte</span>
              </Link>
            </div>
          )}
        </nav>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
