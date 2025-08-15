import { requireSuperAdmin } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Settings, Edit } from "lucide-react";
import Link from "next/link";
import AudioCategoryForm from "@/components/audio-category-form";
import AudioCategoryList from "@/components/audio-category-list";

export default async function AudioCategoriesPage() {
  await requireSuperAdmin();
  const supabase = await createClient();

  // Get all categories with audio count
  const { data: categories, error } = await supabase
    .from("audio_categories")
    .select(`
      *,
      audio_files (count)
    `)
    .order("sort_order");

  if (error) {
    console.error("Error fetching categories:", error);
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
            <Settings className="h-8 w-8 text-violet-600" />
            Categorias de Áudio
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie as categorias para organizar os arquivos de áudio
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Nova Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AudioCategoryForm />
            </CardContent>
          </Card>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Categorias Existentes</CardTitle>
            </CardHeader>
            <CardContent>
              <AudioCategoryList categories={categories || []} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}