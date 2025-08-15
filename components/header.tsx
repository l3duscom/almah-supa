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
    <header className="bg-violet-500/90 backdrop-blur-md border-b border-violet-400/30 shadow-lg shadow-violet-900/20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl md:text-2xl font-bold flex items-center gap-2 flex-1">
            <Heart className="h-5 w-5 md:h-6 md:w-6 text-white" />
            <span className="text-white font-bold">
              Almah
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link
              href="/app/diario"
              className="text-white hover:text-violet-200 text-sm flex gap-2 items-center transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Diário
            </Link>

            <Link
              href="/app/grupos"
              className="text-white hover:text-violet-200 text-sm flex gap-2 items-center transition-colors"
            >
              <UsersRound className="w-4 h-4" />
              Meu grupos
            </Link>


            <Link
              href="/app/planos"
              className={`text-sm flex gap-2 items-center transition-colors ${
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
                className="text-orange-300 text-sm flex gap-2 items-center hover:text-orange-200 transition-colors"
              >
                <Terminal className="w-4 h-4" />
                Console
              </Link>
            )}

            <Button asChild variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:border-white/50">
              <Link href="/app/grupos/novo">Novo grupo</Link>
            </Button>

            <form action={signOut}>
              <Button variant="ghost" type="submit" size="sm" className="text-white hover:text-violet-200 hover:bg-white/10">
                <LogOut className="w-4 h-4" />
              </Button>
            </form>
          </nav>

          {/* Mobile Navigation */}
          <div className="flex-shrink-0">
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
