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
          <div className="fixed top-0 right-0 h-full w-72 sm:w-80 bg-violet-600/95 backdrop-blur-md shadow-xl z-50 transform transition-transform duration-300 ease-out">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-violet-400/30">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-white" />
                  <span className="font-bold text-white">Almah</span>
                </div>
                <button
                  onClick={closeMenu}
                  className="p-2 rounded-lg hover:bg-white/10 text-white transition-all duration-200 hover:scale-105"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Info */}
              <div className="p-4 border-b border-violet-400/30 bg-gradient-to-r from-violet-700/50 to-violet-600/50">
                <p className="font-medium text-sm text-white truncate">{user?.name || user?.email}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {isPremium ? (
                    <span className="flex items-center gap-1 text-xs text-yellow-300 bg-yellow-300/10 px-2 py-1 rounded-full">
                      <Crown className="w-3 h-3" />
                      Premium
                    </span>
                  ) : (
                    <span className="text-xs text-violet-200 bg-violet-200/10 px-2 py-1 rounded-full">Plano Gratuito</span>
                  )}
                  {isSuperAdmin && (
                    <span className="text-xs bg-orange-500/80 text-white px-2 py-1 rounded-full font-medium">
                      Super Admin
                    </span>
                  )}
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <Link
                  href="/app/diario"
                  onClick={closeMenu}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-all duration-200 text-white/90 hover:text-white hover:scale-105"
                >
                  <BookOpen className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">Diário</span>
                </Link>

                <Link
                  href="/app/grupos"
                  onClick={closeMenu}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-all duration-200 text-white/90 hover:text-white hover:scale-105"
                >
                  <UsersRound className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">Meus Grupos</span>
                </Link>

                <Link
                  href="/app/grupos/novo"
                  onClick={closeMenu}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-all duration-200 text-white/90 hover:text-white hover:scale-105 border border-white/20"
                >
                  <Plus className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">Novo Grupo</span>
                </Link>

                <Link
                  href="/app/planos"
                  onClick={closeMenu}
                  className={`flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-all duration-200 hover:scale-105 ${
                    isPremium ? 'text-yellow-300 hover:text-yellow-200' : 'text-violet-200 hover:text-white'
                  }`}
                >
                  {isPremium ? (
                    <Crown className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <CreditCard className="w-5 h-5 flex-shrink-0" />
                  )}
                  <span className="font-medium flex-1">{isPremium ? 'Premium' : 'Fazer Upgrade'}</span>
                  {!isPremium && (
                    <span className="bg-gradient-to-r from-violet-400 to-purple-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      R$ 19/mês
                    </span>
                  )}
                </Link>

                {isSuperAdmin && (
                  <Link
                    href="/app/console"
                    onClick={closeMenu}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-500/10 transition-all duration-200 text-orange-300 hover:text-orange-200 hover:scale-105 border border-orange-500/20"
                  >
                    <Terminal className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">Console Admin</span>
                  </Link>
                )}
              </nav>

              {/* Bottom Actions */}
              <div className="p-4 border-t border-violet-400/30 bg-violet-700/30">
                <form action={signOut}>
                  <Button 
                    type="submit" 
                    variant="ghost" 
                    className="w-full justify-start gap-3 text-red-300 hover:text-red-200 hover:bg-red-500/20 transition-all duration-200 hover:scale-105 rounded-xl p-3"
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