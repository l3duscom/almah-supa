import { requireSuperAdmin } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, BarChart3 } from "lucide-react";
import Link from "next/link";
import AudioMoodForm from "@/components/audio-mood-form";
import AudioMoodList from "@/components/audio-mood-list";

export default async function AudioMoodsPage() {
  await requireSuperAdmin();
  const supabase = await createClient();

  // Get all moods with audio count
  const { data: moods, error } = await supabase
    .from("audio_moods")
    .select(`
      *,
      audio_files (count)
    `)
    .order("mood_level");

  if (error) {
    console.error("Error fetching moods:", error);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="outline" size="sm">
          <Link href="/app/console/audio">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-violet-600" />
            Humores de Áudio
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie os humores para categorizar áudios por estado emocional (1-5)
          </p>
        </div>
      </div>

      {/* Info Card */}
      <Card className="mb-8 bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">ℹ️ Como funcionam os Humores</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700">
          <p className="mb-2">
            Os humores são classificados em 5 níveis baseados no estado emocional:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>Nível 1:</strong> Muito Triste - Para momentos de tristeza profunda</li>
            <li><strong>Nível 2:</strong> Triste - Para momentos de melancolia</li>
            <li><strong>Nível 3:</strong> Neutro - Para momentos de equilíbrio</li>
            <li><strong>Nível 4:</strong> Feliz - Para momentos de alegria</li>
            <li><strong>Nível 5:</strong> Muito Feliz - Para momentos de euforia</li>
          </ul>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Novo Humor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AudioMoodForm />
            </CardContent>
          </Card>
        </div>

        {/* Moods List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Humores Existentes</CardTitle>
            </CardHeader>
            <CardContent>
              <AudioMoodList moods={moods || []} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}