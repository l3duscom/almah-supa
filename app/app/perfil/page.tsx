'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { User, Phone, Instagram, Facebook, Twitter, Linkedin, Globe, Briefcase } from 'lucide-react'
import { ClienteCompleto, ClientePerfilForm } from '@/lib/types/cliente'
import { createClient } from '@/utils/supabase/client'

export default function PerfilPage() {
  const [, setCliente] = useState<ClienteCompleto | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<ClientePerfilForm>({})

  useEffect(() => {
    loadClienteProfile()
  }, [])

  const loadClienteProfile = async () => {
    try {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login'
        return
      }

      const response = await fetch('/api/cliente')
      const result = await response.json()

      if (result.success && result.cliente) {
        const clienteData = result.cliente
        setCliente(clienteData)
        setFormData({
          nome_display: clienteData.nome_display || '',
          telefone: clienteData.telefone || '',
          whatsapp: clienteData.whatsapp || '',
          endereco: clienteData.endereco || {},
          instagram: clienteData.instagram || '',
          facebook: clienteData.facebook || '',
          twitter: clienteData.twitter || '',
          linkedin: clienteData.linkedin || '',
          tiktok: clienteData.tiktok || '',
          website: clienteData.website || '',
          empresa: clienteData.empresa || '',
          cargo: clienteData.cargo || '',
          setor: clienteData.setor || '',
          data_nascimento: clienteData.data_nascimento || '',
          genero: clienteData.genero,
          preferencias: clienteData.preferencias || {},
          configuracoes: clienteData.configuracoes || {},
        })
      }
    } catch (error) {
      console.error('Error loading cliente profile:', error)
      setError('Erro ao carregar perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/cliente', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(true)
        setCliente(prev => ({ ...prev, ...result.cliente }))
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(result.error || 'Erro ao salvar perfil')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      setError('Erro ao salvar perfil')
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: keyof ClientePerfilForm, value: string | Record<string, unknown>) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const updateEndereco = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      endereco: { ...prev.endereco, [field]: value }
    }))
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
        <span className="ml-2">Carregando perfil...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Meu Perfil</h1>
        <p className="text-gray-400">Gerencie suas informações pessoais e preferências</p>
      </div>

      {success && (
        <Alert className="mb-6 bg-green-500/10 border-green-500/20">
          <AlertDescription className="text-green-400">
            Perfil atualizado com sucesso!
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="mb-6 bg-red-500/10 border-red-500/20">
          <AlertDescription className="text-red-400">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="pessoal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pessoal">
            <User className="w-4 h-4 mr-2" />
            Pessoal
          </TabsTrigger>
          <TabsTrigger value="contato">
            <Phone className="w-4 h-4 mr-2" />
            Contato
          </TabsTrigger>
          <TabsTrigger value="social">
            <Instagram className="w-4 h-4 mr-2" />
            Social
          </TabsTrigger>
          <TabsTrigger value="profissional">
            <Briefcase className="w-4 h-4 mr-2" />
            Profissional
          </TabsTrigger>
        </TabsList>

        {/* Pessoal Tab */}
        <TabsContent value="pessoal">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Informações Pessoais</CardTitle>
              <CardDescription>Suas informações básicas e dados pessoais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome_display" className="text-gray-300">Nome de Exibição</Label>
                  <Input
                    id="nome_display"
                    value={formData.nome_display}
                    onChange={(e) => updateField('nome_display', e.target.value)}
                    placeholder="Como você quer ser chamado"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="data_nascimento" className="text-gray-300">Data de Nascimento</Label>
                  <Input
                    id="data_nascimento"
                    type="date"
                    value={formData.data_nascimento}
                    onChange={(e) => updateField('data_nascimento', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="genero" className="text-gray-300">Gênero</Label>
                <Select value={formData.genero} onValueChange={(value) => updateField('genero', value)}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="feminino">Feminino</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                    <SelectItem value="prefiro_nao_informar">Prefiro não informar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contato Tab */}
        <TabsContent value="contato">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Informações de Contato</CardTitle>
              <CardDescription>Telefone, WhatsApp e endereço</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telefone" className="text-gray-300">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => updateField('telefone', e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="whatsapp" className="text-gray-300">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => updateField('whatsapp', e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-gray-300">Endereço</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Rua"
                    value={formData.endereco?.rua || ''}
                    onChange={(e) => updateEndereco('rua', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <Input
                    placeholder="Cidade"
                    value={formData.endereco?.cidade || ''}
                    onChange={(e) => updateEndereco('cidade', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <Input
                    placeholder="Estado"
                    value={formData.endereco?.estado || ''}
                    onChange={(e) => updateEndereco('estado', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <Input
                    placeholder="CEP"
                    value={formData.endereco?.cep || ''}
                    onChange={(e) => updateEndereco('cep', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Tab */}
        <TabsContent value="social">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Redes Sociais</CardTitle>
              <CardDescription>Seus perfis em redes sociais e website</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="instagram" className="text-gray-300">Instagram</Label>
                  <div className="relative">
                    <Instagram className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="instagram"
                      value={formData.instagram}
                      onChange={(e) => updateField('instagram', e.target.value)}
                      placeholder="@seuusuario"
                      className="pl-10 bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="facebook" className="text-gray-300">Facebook</Label>
                  <div className="relative">
                    <Facebook className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="facebook"
                      value={formData.facebook}
                      onChange={(e) => updateField('facebook', e.target.value)}
                      placeholder="facebook.com/seuusuario"
                      className="pl-10 bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="twitter" className="text-gray-300">Twitter/X</Label>
                  <div className="relative">
                    <Twitter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="twitter"
                      value={formData.twitter}
                      onChange={(e) => updateField('twitter', e.target.value)}
                      placeholder="@seuusuario"
                      className="pl-10 bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="linkedin" className="text-gray-300">LinkedIn</Label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="linkedin"
                      value={formData.linkedin}
                      onChange={(e) => updateField('linkedin', e.target.value)}
                      placeholder="linkedin.com/in/seuusuario"
                      className="pl-10 bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="website" className="text-gray-300">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => updateField('website', e.target.value)}
                    placeholder="https://seusite.com"
                    className="pl-10 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profissional Tab */}
        <TabsContent value="profissional">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Informações Profissionais</CardTitle>
              <CardDescription>Dados sobre sua carreira e empresa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="empresa" className="text-gray-300">Empresa</Label>
                  <Input
                    id="empresa"
                    value={formData.empresa}
                    onChange={(e) => updateField('empresa', e.target.value)}
                    placeholder="Nome da empresa"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="cargo" className="text-gray-300">Cargo</Label>
                  <Input
                    id="cargo"
                    value={formData.cargo}
                    onChange={(e) => updateField('cargo', e.target.value)}
                    placeholder="Seu cargo"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="setor" className="text-gray-300">Setor</Label>
                <Input
                  id="setor"
                  value={formData.setor}
                  onChange={(e) => updateField('setor', e.target.value)}
                  placeholder="Setor da empresa"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-yellow-500 hover:bg-yellow-600 text-gray-900"
        >
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </div>
  )
}