'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Gift, UsersRound, Terminal, LogOut, Crown, CreditCard, Menu, X, Plus } from "lucide-react";
import Link from "next/link";
import { signOut } from "@/app/logout/actions";

interface MobileNavProps {
  user: any;
  isSuperAdmin: boolean;
  isPremium: boolean;
}

export default function MobileNav({ user, isSuperAdmin, isPremium }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <div className="md:hidden">
      {/* Hamburger Menu Button */}
      <button
        onClick={toggleMenu}
        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mr-2"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
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
          <div className="fixed top-0 right-0 h-full w-64 bg-white dark:bg-gray-900 shadow-xl z-50 transform transition-transform duration-300">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-red-400" />
                  <span className="font-bold">Amigo Secreto</span>
                </div>
                <button
                  onClick={closeMenu}
                  className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User Info */}
              <div className="p-4 border-b bg-gray-50 dark:bg-gray-800">
                <p className="font-medium text-sm">{user?.name || user?.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  {isPremium ? (
                    <span className="flex items-center gap-1 text-xs text-yellow-600">
                      <Crown className="w-3 h-3" />
                      Premium
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500">Plano Gratuito</span>
                  )}
                  {isSuperAdmin && (
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded">
                      Super Admin
                    </span>
                  )}
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 p-4 space-y-2">
                <Link
                  href="/app/grupos"
                  onClick={closeMenu}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <UsersRound className="w-5 h-5 text-gray-600" />
                  <span>Meus Grupos</span>
                </Link>

                <Link
                  href="/app/grupos/novo"
                  onClick={closeMenu}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Plus className="w-5 h-5 text-gray-600" />
                  <span>Novo Grupo</span>
                </Link>

                <Link
                  href="/app/planos"
                  onClick={closeMenu}
                  className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                    isPremium ? 'text-yellow-600' : 'text-gray-600'
                  }`}
                >
                  {isPremium ? (
                    <Crown className="w-5 h-5" />
                  ) : (
                    <CreditCard className="w-5 h-5" />
                  )}
                  <span>{isPremium ? 'Premium' : 'Fazer Upgrade'}</span>
                  {!isPremium && (
                    <span className="ml-auto bg-gradient-to-r from-cyan-400 to-teal-500 text-white text-xs px-2 py-1 rounded">
                      R$ 19/mês
                    </span>
                  )}
                </Link>

                {isSuperAdmin && (
                  <Link
                    href="/app/console"
                    onClick={closeMenu}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-orange-600"
                  >
                    <Terminal className="w-5 h-5" />
                    <span>Console Admin</span>
                  </Link>
                )}
              </nav>

              {/* Bottom Actions */}
              <div className="p-4 border-t">
                <form action={signOut}>
                  <Button 
                    type="submit" 
                    variant="ghost" 
                    className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="w-5 h-5" />
                    Sair
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