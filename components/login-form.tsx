"use client";

import { login, LoginState, signInWithGoogle, signInWithApple } from "@/app/(auth)/login/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader, MessageCircle } from "lucide-react";
import { useActionState } from "react";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    login,
    {
      success: null,
      message: "",
    }
  );

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Faça login com Google ou digite seu email para receber um link de login.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <form action={signInWithGoogle}>
            <Button type="submit" variant="outline" className="w-full">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>
          </form>

          {/* Apple Sign-In - Disabled for now, but logic is ready for future use */}
          {false && (
            <form action={signInWithApple}>
              <Button type="submit" variant="outline" className="w-full bg-black hover:bg-gray-900 text-white border-gray-600">
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
                </svg>
                Continue with Apple
              </Button>
            </form>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Ou continue com email
              </span>
            </div>
          </div>

          <form action={formAction}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="seuemail@gmail.com"
                  required
                />
              </div>

              {state.success === true && (
                <Alert className="text-muted-foreground">
                  <MessageCircle className="h-4 w-4 !text-green-600" />
                  <AlertTitle className="text-gray-50">Email enviado!</AlertTitle>
                  <AlertDescription>
                    Confira seu inbox para acessar o link de login.
                  </AlertDescription>
                </Alert>
              )}

              {state.success === false && (
                <Alert className="text-muted-foreground">
                  <MessageCircle className="h-4 w-4 !text-red-600" />
                  <AlertTitle className="text-gray-50">Erro!</AlertTitle>
                  <AlertDescription>
                    Ocorreu um erro ao enviar o link de login. Por favor, entre em
                    contato com o suporte!
                  </AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full">
                {pending && <Loader className="animate-spin" />}
                Login with Email
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
