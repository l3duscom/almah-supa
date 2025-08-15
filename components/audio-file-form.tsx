"use client";

import { useState, useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createAudioFile, AudioFileActionState } from "@/app/app/console/audio/files/actions";
import AudioFileUpload from "@/components/audio-file-upload";
import { Loader2, Upload, Info, Link, FileUp } from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: string | null;
}

interface Mood {
  id: string;
  name: string;
  mood_level: number;
}

interface AudioFileFormProps {
  categories: Category[];
  moods: Mood[];
}

export default function AudioFileForm({ categories, moods }: AudioFileFormProps) {
  const [uploadMethod, setUploadMethod] = useState<"upload" | "url">("upload");
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    description: "",
    file_url: "",
    storage_path: "",
    duration_seconds: "",
    file_size_bytes: "",
    file_format: "",
    category_id: "",
    mood_id: "",
    tags: "",
    is_premium: false,
  });

  const [state, formAction, pending] = useActionState<AudioFileActionState, FormData>(
    createAudioFile,
    { success: false }
  );

  const handleSubmit = (formDataObj: FormData) => {
    formAction(formDataObj);
    if (state.success) {
      setFormData({
        title: "",
        artist: "",
        description: "",
        file_url: "",
        storage_path: "",
        duration_seconds: "",
        file_size_bytes: "",
        file_format: "",
        category_id: "",
        mood_id: "",
        tags: "",
        is_premium: false,
      });
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const detectFileFormat = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    if (extension && ['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(extension)) {
      setFormData(prev => ({ ...prev, file_format: extension }));
    }
  };

  const handleUrlChange = (url: string) => {
    setFormData(prev => ({ ...prev, file_url: url, storage_path: "" }));
    detectFileFormat(url);
  };

  const handleFileUploaded = (fileData: {
    storage_path: string;
    duration_seconds: number | null;
    file_size_bytes: number;
    file_format: string;
    original_name: string;
  }) => {
    setFormData(prev => ({
      ...prev,
      storage_path: fileData.storage_path,
      duration_seconds: fileData.duration_seconds?.toString() || "",
      file_size_bytes: fileData.file_size_bytes.toString(),
      file_format: fileData.file_format,
      file_url: "", // Clear URL when using upload
      title: prev.title || fileData.original_name.replace(/\.[^/.]+$/, '') // Set title if empty
    }));
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título *</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={(e) => handleInputChange("title", e.target.value)}
          placeholder="Nome do arquivo de áudio"
          disabled={pending}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="artist">Artista</Label>
        <Input
          id="artist"
          name="artist"
          value={formData.artist}
          onChange={(e) => handleInputChange("artist", e.target.value)}
          placeholder="Nome do artista ou criador"
          disabled={pending}
        />
      </div>

      <div className="space-y-2">
        <Label>Arquivo de Áudio *</Label>
        <Tabs value={uploadMethod} onValueChange={(value) => setUploadMethod(value as "upload" | "url")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <FileUp className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="url" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              URL
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-2">
            <AudioFileUpload 
              onFileUploaded={handleFileUploaded}
              disabled={pending}
            />
            {formData.storage_path && (
              <input type="hidden" name="storage_path" value={formData.storage_path} />
            )}
          </TabsContent>
          
          <TabsContent value="url" className="space-y-2">
            <Input
              id="file_url"
              name="file_url"
              type="url"
              value={formData.file_url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://exemplo.com/audio.mp3"
              disabled={pending}
            />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="h-3 w-3" />
              Suporte para: MP3, WAV, OGG, M4A, FLAC
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category_id">Categoria</Label>
          <Select 
            name="category_id" 
            value={formData.category_id} 
            onValueChange={(value) => handleInputChange("category_id", value)}
            disabled={pending}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecionar categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    {category.icon && <span>{category.icon}</span>}
                    {category.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mood_id">Humor</Label>
          <Select 
            name="mood_id" 
            value={formData.mood_id} 
            onValueChange={(value) => handleInputChange("mood_id", value)}
            disabled={pending}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecionar humor" />
            </SelectTrigger>
            <SelectContent>
              {moods.map((mood) => (
                <SelectItem key={mood.id} value={mood.id}>
                  Nível {mood.mood_level} - {mood.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="Descrição do arquivo de áudio"
          disabled={pending}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration_seconds">Duração (segundos)</Label>
          <Input
            id="duration_seconds"
            name="duration_seconds"
            type="number"
            value={formData.duration_seconds}
            onChange={(e) => handleInputChange("duration_seconds", e.target.value)}
            placeholder="300"
            disabled={pending}
            min="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="file_size_bytes">Tamanho (bytes)</Label>
          <Input
            id="file_size_bytes"
            name="file_size_bytes"
            type="number"
            value={formData.file_size_bytes}
            onChange={(e) => handleInputChange("file_size_bytes", e.target.value)}
            placeholder="5242880"
            disabled={pending}
            min="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="file_format">Formato</Label>
          <Input
            id="file_format"
            name="file_format"
            value={formData.file_format}
            onChange={(e) => handleInputChange("file_format", e.target.value)}
            placeholder="mp3"
            disabled={pending}
            maxLength={10}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
        <Input
          id="tags"
          name="tags"
          value={formData.tags}
          onChange={(e) => handleInputChange("tags", e.target.value)}
          placeholder="relaxante, meditação, natureza"
          disabled={pending}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_premium"
          name="is_premium"
          checked={formData.is_premium}
          onCheckedChange={(checked) => handleInputChange("is_premium", checked as boolean)}
          disabled={pending}
        />
        <Label htmlFor="is_premium" className="text-sm">
          Arquivo Premium (requer assinatura)
        </Label>
      </div>

      {/* Preview */}
      {(formData.file_url || formData.storage_path) && (
        <div className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Preview:</Label>
          <div className="mt-2">
            {formData.file_url ? (
              <audio 
                controls 
                className="w-full" 
                preload="metadata"
                onError={(e) => console.log("Audio load error:", e)}
              >
                <source src={formData.file_url} type={`audio/${formData.file_format || 'mp3'}`} />
                Seu navegador não suporta o elemento de áudio.
              </audio>
            ) : (
              <div className="text-sm text-muted-foreground">
                Arquivo carregado: {formData.storage_path}
              </div>
            )}
          </div>
        </div>
      )}

      {state.success === false && state.message && (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      {state.success && state.message && (
        <Alert>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <Button 
        type="submit" 
        disabled={pending || !formData.title.trim() || (!formData.file_url.trim() && !formData.storage_path.trim())}
        className="w-full"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            Adicionar Arquivo
          </>
        )}
      </Button>
    </form>
  );
}