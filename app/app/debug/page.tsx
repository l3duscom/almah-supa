import { getCurrentUser } from '@/lib/auth'
import { createClient } from '@/utils/supabase/server'

export default async function DebugPage() {
  const user = await getCurrentUser()
  const supabase = await createClient()

  // Get user from database directly
  let dbUser = null
  if (user?.id) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    
    dbUser = data
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Debug - Status do Usuário</h1>
      
      <div className="bg-gray-800 p-6 rounded-lg mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Usuário Atual (Auth)</h2>
        <pre className="text-sm text-gray-300 overflow-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Usuário no Database</h2>
        <pre className="text-sm text-gray-300 overflow-auto">
          {JSON.stringify(dbUser, null, 2)}
        </pre>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-lg font-semibold text-white mb-4">Status</h2>
        <p className="text-white">
          <strong>É Super Admin:</strong> {user?.role === 'super_admin' ? '✅ Sim' : '❌ Não'}
        </p>
        <p className="text-white mt-2">
          <strong>Role atual:</strong> {user?.role || 'Não definido'}
        </p>
        <p className="text-white mt-2">
          <strong>Email:</strong> {user?.email || 'Não encontrado'}
        </p>
      </div>
    </div>
  )
}