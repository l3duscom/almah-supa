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
    <header className="border-b border-white/20 bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl md:text-2xl font-bold flex items-center gap-2 flex-1">
            <Heart className="h-5 w-5 md:h-6 md:w-6 text-emerald-500" />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Almah
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link
              href="/app/diario"
              className="text-foreground text-sm flex gap-2 items-center"
            >
              <BookOpen className="w-4 h-4" />
              Diário
            </Link>

            <Link
              href="/app/grupos"
              className="text-foreground text-sm flex gap-2 items-center"
            >
              <UsersRound className="w-4 h-4" />
              Meu grupos
            </Link>


            <Link
              href="/app/planos"
              className={`text-sm flex gap-2 items-center ${
                isPremium 
                  ? 'text-yellow-400 hover:text-yellow-300' 
                  : 'text-gray-400 hover:text-gray-300'
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
                className="text-orange-400 text-sm flex gap-2 items-center hover:text-orange-300"
              >
                <Terminal className="w-4 h-4" />
                Console
              </Link>
            )}

            <Button asChild variant="outline">
              <Link href="/app/grupos/novo">Novo grupo</Link>
            </Button>

            <form action={signOut}>
              <Button variant="ghost" type="submit" size="sm">
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
