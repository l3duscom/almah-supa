import { requireSuperAdmin } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Music, Search } from "lucide-react";
import Link from "next/link";
import AudioFileForm from "@/components/audio-file-form";
import AudioFileList from "@/components/audio-file-list";
import AudioFileFilters from "@/components/audio-file-filters";

interface SearchParams {
  search?: string;
  category?: string;
  mood?: string;
  premium?: string;
  active?: string;
  page?: string;
}

export default async function AudioFilesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireSuperAdmin();
  const supabase = await createClient();
  const params = await searchParams;

  // Build query with filters
  let query = supabase
    .from("audio_files")
    .select(`
      *,
      audio_categories (
        id,
        name,
        icon,
        color
      ),
      audio_moods (
        id,
        name,
        mood_level,
        color
      )
    `);

  // Apply filters
  if (params.search) {
    query = query.or(`title.ilike.%${params.search}%,artist.ilike.%${params.search}%`);
  }

  if (params.category) {
    query = query.eq("category_id", params.category);
  }

  if (params.mood) {
    query = query.eq("mood_id", params.mood);
  }

  if (params.premium !== undefined) {
    query = query.eq("is_premium", params.premium === "true");
  }

  if (params.active !== undefined) {
    query = query.eq("is_active", params.active === "true");
  }

  // Pagination
  const page = parseInt(params.page || "1");
  const pageSize = 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: audioFiles, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  // Get categories and moods for filters
  const [categoriesResult, moodsResult] = await Promise.all([
    supabase
      .from("audio_categories")
      .select("id, name, icon")
      .eq("is_active", true)
      .order("sort_order"),
    
    supabase
      .from("audio_moods")
      .select("id, name, mood_level")
      .eq("is_active", true)
      .order("mood_level")
  ]);

  const categories = categoriesResult.data || [];
  const moods = moodsResult.data || [];

  if (error) {
    console.error("Error fetching audio files:", error);
  }

  const totalPages = count ? Math.ceil(count / pageSize) : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="outline" size="sm">
          <Link href="/app/console/audio">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Music className="h-8 w-8 text-violet-600" />
            Arquivos de Áudio
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie todos os arquivos de áudio do sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {count || 0} arquivo{(count || 0) !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{count || 0}</div>
            <p className="text-xs text-muted-foreground">Total de arquivos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {audioFiles?.filter(f => f.is_active).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {audioFiles?.filter(f => f.is_premium).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Premium</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {audioFiles?.reduce((sum, f) => sum + (f.play_count || 0), 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">Total de plays</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Add File Form */}
        <div className="xl:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Novo Arquivo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AudioFileForm categories={categories} moods={moods} />
            </CardContent>
          </Card>
        </div>

        {/* Files List */}
        <div className="xl:col-span-3 space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Filtros e Busca
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AudioFileFilters 
                categories={categories} 
                moods={moods}
                currentParams={params}
              />
            </CardContent>
          </Card>

          {/* Files List */}
          <Card>
            <CardHeader>
              <CardTitle>
                Arquivos de Áudio
                {params.search && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    - Resultados para "{params.search}"
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AudioFileList 
                audioFiles={audioFiles || []} 
                currentPage={page}
                totalPages={totalPages}
                currentParams={params}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}