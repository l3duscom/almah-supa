"use client";

import { useState, useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createAudioCategory, AudioCategoryActionState } from "@/app/app/console/audio/categories/actions";
import { Loader2 } from "lucide-react";

export default function AudioCategoryForm() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    color: "#10B981",
    sort_order: "0",
  });

  const [state, formAction, pending] = useActionState<AudioCategoryActionState, FormData>(
    createAudioCategory,
    { success: false }
  );

  const handleSubmit = (formDataObj: FormData) => {
    formAction(formDataObj);
    if (state.success) {
      setFormData({
        name: "",
        description: "",
        icon: "",
        color: "#10B981",
        sort_order: "0",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome da Categoria *</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          placeholder="Ex: Meditação"
          disabled={pending}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="Descreva o tipo de áudio desta categoria"
          disabled={pending}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="icon">Ícone (Emoji)</Label>
          <Input
            id="icon"
            name="icon"
            value={formData.icon}
            onChange={(e) => handleInputChange("icon", e.target.value)}
            placeholder="🧘"
            disabled={pending}
            maxLength={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="color">Cor</Label>
          <Input
            id="color"
            name="color"
            type="color"
            value={formData.color}
            onChange={(e) => handleInputChange("color", e.target.value)}
            disabled={pending}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sort_order">Ordem de Exibição</Label>
        <Input
          id="sort_order"
          name="sort_order"
          type="number"
          value={formData.sort_order}
          onChange={(e) => handleInputChange("sort_order", e.target.value)}
          placeholder="0"
          disabled={pending}
          min="0"
        />
      </div>

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
        disabled={pending || !formData.name.trim()}
        className="w-full"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Criando...
          </>
        ) : (
          "Criar Categoria"
        )}
      </Button>
    </form>
  );
}