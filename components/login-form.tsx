"use client";

import { login, LoginState, signInWithGoogle } from "@/app/(auth)/login/actions";
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
