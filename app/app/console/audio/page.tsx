import { requireSuperAdmin } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Music, Play, Plus, Settings, BarChart3 } from "lucide-react";
import Link from "next/link";

export default async function AudioManagementPage() {
  await requireSuperAdmin();
  const supabase = await createClient();

  // Get audio statistics
  const [categoriesResult, moodsResult, filesResult] = await Promise.all([
    supabase
      .from("audio_categories")
      .select("id, name, is_active")
      .order("sort_order"),
    
    supabase
      .from("audio_moods")
      .select("id, name, mood_level, is_active")
      .order("mood_level"),
    
    supabase
      .from("audio_files")
      .select(`
        id,
        title,
        artist,
        is_premium,
        is_active,
        play_count,
        category_id,
        mood_id
      `)
      .order("created_at", { ascending: false })
      .limit(10)
  ]);

  const categories = categoriesResult.data || [];
  const moods = moodsResult.data || [];
  const recentFiles = (filesResult.data || []) as Array<{
    id: string;
    title: string;
    artist: string | null;
    is_premium: boolean;
    is_active: boolean;
    play_count: number;
    category_id: string | null;
    mood_id: string | null;
  }>;

  // Calculate statistics
  const totalCategories = categories.length;
  const activeCategories = categories.filter(c => c.is_active).length;
  const totalMoods = moods.length;
  const activeMoods = moods.filter(m => m.is_active).length;

  const { count: totalFiles } = await supabase
    .from("audio_files")
    .select("*", { count: "exact", head: true });

  const { count: activeFiles } = await supabase
    .from("audio_files")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  const { count: premiumFiles } = await supabase
    .from("audio_files")
    .select("*", { count: "exact", head: true })
    .eq("is_premium", true)
    .eq("is_active", true);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Music className="h-8 w-8 text-violet-600" />
            Gerenciamento de Áudios
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie categorias, humores e arquivos de áudio do sistema
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorias</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCategories}</div>
            <p className="text-xs text-muted-foreground">
              {totalCategories} total ({totalCategories - activeCategories} inativas)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Humores</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeMoods}</div>
            <p className="text-xs text-muted-foreground">
              {totalMoods} total ({totalMoods - activeMoods} inativos)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Arquivos de Áudio</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeFiles || 0}</div>
            <p className="text-xs text-muted-foreground">
              {totalFiles || 0} total ({(totalFiles || 0) - (activeFiles || 0)} inativos)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premium</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{premiumFiles || 0}</div>
            <p className="text-xs text-muted-foreground">
              áudios premium ativos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Management Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Categories Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Categorias de Áudio</span>
              <Button asChild size="sm">
                <Link href="/app/console/audio/categories">
                  <Plus className="h-4 w-4 mr-2" />
                  Gerenciar
                </Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categories.slice(0, 5).map((category) => (
                <div key={category.id} className="flex items-center justify-between p-2 border rounded">
                  <span className="font-medium">{category.name}</span>
                  <Badge variant={category.is_active ? "default" : "secondary"}>
                    {category.is_active ? "Ativa" : "Inativa"}
                  </Badge>
                </div>
              ))}
              {categories.length > 5 && (
                <p className="text-sm text-muted-foreground text-center">
                  +{categories.length - 5} mais categorias
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Moods Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Humores</span>
              <Button asChild size="sm">
                <Link href="/app/console/audio/moods">
                  <Plus className="h-4 w-4 mr-2" />
                  Gerenciar
                </Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {moods.map((mood) => (
                <div key={mood.id} className="flex items-center justify-between p-2 border rounded">
                  <span className="font-medium">{mood.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Nível {mood.mood_level}</Badge>
                    <Badge variant={mood.is_active ? "default" : "secondary"}>
                      {mood.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Audio Files */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Arquivos de Áudio Recentes</span>
            <Button asChild>
              <Link href="/app/console/audio/files">
                <Plus className="h-4 w-4 mr-2" />
                Gerenciar Arquivos
              </Link>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{file.title}</h4>
                  {file.artist && (
                    <p className="text-sm text-muted-foreground">por {file.artist}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {file.category_id && (
                      <Badge variant="secondary">
                        {categories.find(c => c.id === file.category_id)?.name || 'Categoria'}
                      </Badge>
                    )}
                    {file.mood_id && (
                      <Badge variant="outline">
                        {moods.find(m => m.id === file.mood_id)?.name || 'Humor'}
                      </Badge>
                    )}
                    {file.is_premium && (
                      <Badge className="bg-yellow-500">Premium</Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <Play className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {file.play_count || 0} plays
                    </span>
                  </div>
                  <Badge variant={file.is_active ? "default" : "secondary"}>
                    {file.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </div>
            ))}
            {recentFiles.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nenhum arquivo de áudio encontrado
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}