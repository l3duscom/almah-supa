'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, UsersRound, Terminal, LogOut, Crown, CreditCard, Menu, X, Plus, BookOpen } from "lucide-react";
import Link from "next/link";
import { signOut } from "@/app/logout/actions";

interface MobileNavProps {
  user: {
    id: string;
    email?: string;
    name?: string;
    role?: string;
    plan?: string;
  } | null;
  isSuperAdmin: boolean;
  isPremium: boolean;
}

export default function MobileNav({ user, isSuperAdmin, isPremium }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <div className="lg:hidden">
      {/* Hamburger Menu Button */}
      <button
        onClick={toggleMenu}
        className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-white hover:scale-105"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={closeMenu}
          />
          
          {/* Menu Panel */}
          <div className="fixed top-0 right-0 h-full w-72 sm:w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-out border-l border-gray-200">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-violet-600" />
                  <span className="font-bold text-gray-900">Almah</span>
                </div>
                <button
                  onClick={closeMenu}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-all duration-200 hover:scale-105"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Info */}
              <div className="p-3 border-b border-gray-200 bg-gray-50">
                <p className="font-medium text-sm text-gray-900 truncate">{user?.name || user?.email}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {isPremium ? (
                    <span className="flex items-center gap-1 text-xs text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
                      <Crown className="w-3 h-3" />
                      Premium
                    </span>
                  ) : (
                    <span className="text-xs text-gray-600 bg-gray-200 px-2 py-0.5 rounded-full">Gratuito</span>
                  )}
                  {isSuperAdmin && (
                    <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-medium">
                      Admin
                    </span>
                  )}
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 p-4 space-y-2 bg-white">
                {/* Botão principal - Meu Diário */}
                <Link
                  href="/app/diario"
                  onClick={closeMenu}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 transition-all duration-300 text-white hover:scale-105 shadow-lg"
                >
                  <BookOpen className="w-5 h-5 flex-shrink-0" />
                  <span className="font-semibold">Meu Diário</span>
                </Link>

                <Link
                  href="/app/grupos"
                  onClick={closeMenu}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition-all duration-200 text-gray-700 hover:text-gray-900 hover:scale-105"
                >
                  <UsersRound className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">Meus Grupos</span>
                </Link>

                <Link
                  href="/app/grupos/novo"
                  onClick={closeMenu}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition-all duration-200 text-gray-700 hover:text-gray-900 hover:scale-105"
                >
                  <Plus className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">Novo Grupo</span>
                </Link>

                <Link
                  href="/app/planos"
                  onClick={closeMenu}
                  className={`flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:scale-105 ${
                    isPremium ? 'text-yellow-600 hover:text-yellow-700' : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  {isPremium ? (
                    <Crown className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <CreditCard className="w-5 h-5 flex-shrink-0" />
                  )}
                  <span className="font-medium flex-1">{isPremium ? 'Premium' : 'Upgrade'}</span>
                  {!isPremium && (
                    <span className="bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                      R$ 19
                    </span>
                  )}
                </Link>

                {isSuperAdmin && (
                  <Link
                    href="/app/console"
                    onClick={closeMenu}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 transition-all duration-200 text-orange-600 hover:text-orange-700 hover:scale-105 border border-orange-200"
                  >
                    <Terminal className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">Console</span>
                  </Link>
                )}
              </nav>

              {/* Bottom Actions */}
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <form action={signOut}>
                  <Button 
                    type="submit" 
                    variant="ghost" 
                    className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 hover:scale-105 rounded-xl py-2"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sair</span>
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}