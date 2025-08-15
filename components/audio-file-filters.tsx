"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, Filter } from "lucide-react";

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

interface SearchParams {
  search?: string;
  category?: string;
  mood?: string;
  premium?: string;
  active?: string;
  page?: string;
}

interface AudioFileFiltersProps {
  categories: Category[];
  moods: Mood[];
  currentParams: SearchParams;
}

export default function AudioFileFilters({ 
  categories, 
  moods, 
  currentParams 
}: AudioFileFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [filters, setFilters] = useState({
    search: currentParams.search || "",
    category: currentParams.category || "",
    mood: currentParams.mood || "",
    premium: currentParams.premium || "",
    active: currentParams.active || "",
  });

  const applyFilters = () => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "") {
        params.set(key, value);
      }
    });

    // Reset to page 1 when applying filters
    params.delete("page");
    
    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    
    router.push(newUrl);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "",
      mood: "",
      premium: "",
      active: "",
    });
    router.push(pathname);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const hasActiveFilters = Object.values(filters).some(value => value && value !== "");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Buscar</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              placeholder="Título ou artista..."
              className="pl-10"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  applyFilters();
                }
              }}
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <Label>Categoria</Label>
          <Select 
            value={filters.category} 
            onValueChange={(value) => handleFilterChange("category", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
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

        {/* Mood Filter */}
        <div className="space-y-2">
          <Label>Humor</Label>
          <Select 
            value={filters.mood} 
            onValueChange={(value) => handleFilterChange("mood", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos os humores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os humores</SelectItem>
              {moods.map((mood) => (
                <SelectItem key={mood.id} value={mood.id}>
                  Nível {mood.mood_level} - {mood.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Premium Filter */}
        <div className="space-y-2">
          <Label>Tipo</Label>
          <Select 
            value={filters.premium} 
            onValueChange={(value) => handleFilterChange("premium", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="false">Gratuito</SelectItem>
              <SelectItem value="true">Premium</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active Filter */}
        <div className="space-y-2">
          <Label>Status</Label>
          <Select 
            value={filters.active} 
            onValueChange={(value) => handleFilterChange("active", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="true">Ativo</SelectItem>
              <SelectItem value="false">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button onClick={applyFilters} className="flex-1 sm:flex-none">
          <Filter className="h-4 w-4 mr-2" />
          Aplicar Filtros
        </Button>
        
        {hasActiveFilters && (
          <Button variant="outline" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />
            Limpar
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
              <Search className="h-3 w-3" />
              {filters.search}
              <button
                onClick={() => {
                  handleFilterChange("search", "");
                  applyFilters();
                }}
                className="ml-1 hover:text-blue-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          {filters.category && (
            <div className="flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
              {categories.find(c => c.id === filters.category)?.name}
              <button
                onClick={() => {
                  handleFilterChange("category", "");
                  applyFilters();
                }}
                className="ml-1 hover:text-purple-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          {filters.mood && (
            <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
              {moods.find(m => m.id === filters.mood)?.name}
              <button
                onClick={() => {
                  handleFilterChange("mood", "");
                  applyFilters();
                }}
                className="ml-1 hover:text-green-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          {filters.premium && (
            <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
              {filters.premium === "true" ? "Premium" : "Gratuito"}
              <button
                onClick={() => {
                  handleFilterChange("premium", "");
                  applyFilters();
                }}
                className="ml-1 hover:text-yellow-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          {filters.active && (
            <div className="flex items-center gap-1 bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
              {filters.active === "true" ? "Ativo" : "Inativo"}
              <button
                onClick={() => {
                  handleFilterChange("active", "");
                  applyFilters();
                }}
                className="ml-1 hover:text-gray-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}