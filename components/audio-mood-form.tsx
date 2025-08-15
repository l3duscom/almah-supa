"use client";

import { useState, useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createAudioMood, AudioMoodActionState } from "@/app/app/console/audio/moods/actions";
import { Loader2 } from "lucide-react";

const moodLevels = [
  { value: 1, label: "1 - Muito Triste", color: "#EF4444", description: "Para momentos de tristeza profunda" },
  { value: 2, label: "2 - Triste", color: "#F97316", description: "Para momentos de melancolia" },
  { value: 3, label: "3 - Neutro", color: "#EAB308", description: "Para momentos de equilíbrio" },
  { value: 4, label: "4 - Feliz", color: "#22C55E", description: "Para momentos de alegria" },
  { value: 5, label: "5 - Muito Feliz", color: "#10B981", description: "Para momentos de euforia" },
];

export default function AudioMoodForm() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    mood_level: "",
    color: "#EAB308",
  });

  const [state, formAction, pending] = useActionState<AudioMoodActionState, FormData>(
    createAudioMood,
    { success: false }
  );

  const handleSubmit = (formDataObj: FormData) => {
    formAction(formDataObj);
    if (state.success) {
      setFormData({
        name: "",
        description: "",
        mood_level: "",
        color: "#EAB308",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMoodLevelChange = (value: string) => {
    const level = parseInt(value);
    const moodLevel = moodLevels.find(m => m.value === level);
    
    setFormData(prev => ({
      ...prev,
      mood_level: value,
      color: moodLevel?.color || prev.color,
      name: prev.name || moodLevel?.label.split(" - ")[1] || "",
      description: prev.description || moodLevel?.description || "",
    }));
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="mood_level">Nível do Humor *</Label>
        <Select 
          name="mood_level" 
          value={formData.mood_level} 
          onValueChange={handleMoodLevelChange}
          disabled={pending}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o nível (1-5)" />
          </SelectTrigger>
          <SelectContent>
            {moodLevels.map((level) => (
              <SelectItem key={level.value} value={level.value.toString()}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: level.color }}
                  />
                  {level.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nome do Humor *</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          placeholder="Ex: Muito Triste"
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
          placeholder="Descreva quando este humor deve ser usado"
          disabled={pending}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="color">Cor</Label>
        <div className="flex items-center gap-2">
          <Input
            id="color"
            name="color"
            type="color"
            value={formData.color}
            onChange={(e) => handleInputChange("color", e.target.value)}
            disabled={pending}
            className="w-16 h-10"
          />
          <Input
            value={formData.color}
            onChange={(e) => handleInputChange("color", e.target.value)}
            placeholder="#EAB308"
            disabled={pending}
            className="flex-1"
          />
        </div>
      </div>

      {/* Preview */}
      {formData.mood_level && (
        <div className="p-3 border rounded-lg bg-gray-50">
          <Label className="text-sm font-medium text-gray-700">Preview:</Label>
          <div className="flex items-center gap-2 mt-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: formData.color }}
            />
            <span className="font-medium">
              Nível {formData.mood_level} - {formData.name}
            </span>
          </div>
          {formData.description && (
            <p className="text-sm text-gray-600 mt-1">{formData.description}</p>
          )}
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
        disabled={pending || !formData.name.trim() || !formData.mood_level}
        className="w-full"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Criando...
          </>
        ) : (
          "Criar Humor"
        )}
      </Button>
    </form>
  );
}