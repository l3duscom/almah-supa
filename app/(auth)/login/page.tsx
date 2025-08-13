import LoginForm from "@/components/login-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MessageCircle } from "lucide-react";

type LoginPageProps = {
  searchParams: Promise<{
    message?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  
  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4">
        {params.message && (
          <Alert className="text-muted-foreground">
            <MessageCircle className="h-4 w-4 !text-red-600" />
            <AlertTitle className="text-gray-50">Erro na Autenticação</AlertTitle>
            <AlertDescription>
              {params.message === "Could not authenticate user"
                ? "Não foi possível fazer login. Tente novamente."
                : params.message}
            </AlertDescription>
          </Alert>
        )}
        <LoginForm />
      </div>
    </div>
  );
}
