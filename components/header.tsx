import { Button } from "@/components/ui/button";
import { Heart, UsersRound, Terminal, LogOut, Crown, CreditCard, BookOpen } from "lucide-react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { signOut } from "@/app/logout/actions";
import MobileNav from "./mobile-nav";

export default async function Header() {
  const user = await getCurrentUser();
  const isSuperAdmin = user?.role === 'super_admin';
  const isPremium = user?.plan === 'premium' && (
    !user?.plan_expires_at || new Date(user.plan_expires_at) > new Date()
  );
  
  return (
    <header className="sticky top-0 z-50 bg-violet-500/95 backdrop-blur-md border-b border-violet-400/30 shadow-lg shadow-violet-900/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <Heart className="h-6 w-6 text-white flex-shrink-0" />
            <span className="text-xl font-bold text-white truncate">
              Almah
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link
              href="/app/diario"
              className="text-white/90 hover:text-white text-sm font-medium flex gap-2 items-center transition-all duration-200 hover:scale-105"
            >
              <BookOpen className="w-4 h-4" />
              Diário
            </Link>

            <Link
              href="/app/grupos"
              className="text-white/90 hover:text-white text-sm font-medium flex gap-2 items-center transition-all duration-200 hover:scale-105"
            >
              <UsersRound className="w-4 h-4" />
              Meus grupos
            </Link>

            <Link
              href="/app/planos"
              className={`text-sm font-medium flex gap-2 items-center transition-all duration-200 hover:scale-105 ${
                isPremium 
                  ? 'text-yellow-300 hover:text-yellow-200' 
                  : 'text-violet-200 hover:text-white'
              }`}
            >
              {isPremium ? (
                <Crown className="w-4 h-4" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              {isPremium ? 'Premium' : 'Upgrade'}
            </Link>

            {isSuperAdmin && (
              <Link
                href="/app/console"
                className="text-orange-300 text-sm font-medium flex gap-2 items-center hover:text-orange-200 transition-all duration-200 hover:scale-105"
              >
                <Terminal className="w-4 h-4" />
                Console
              </Link>
            )}

            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/20">
              <Button 
                asChild 
                variant="outline" 
                size="sm"
                className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all duration-200 hover:scale-105"
              >
                <Link href="/app/grupos/novo">Novo grupo</Link>
              </Button>

              <form action={signOut}>
                <Button 
                  variant="ghost" 
                  type="submit" 
                  size="sm" 
                  className="text-white/90 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 hover:scale-105"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </nav>

          {/* Mobile Navigation */}
          <div className="lg:hidden">
            <MobileNav 
              user={user}
              isSuperAdmin={isSuperAdmin}
              isPremium={isPremium}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
