import { requireSuperAdmin, getCurrentUser } from '@/lib/auth'
import { createClient } from '@/utils/supabase/server'

export default async function ConsolePage() {
  const user = await requireSuperAdmin()
  const supabase = await createClient()

  // Get all users
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email, name, role, created_at')
    .order('created_at', { ascending: false })

  // Get all groups
  const { data: groups, error: groupsError } = await supabase
    .from('groups')
    .select('id, name, owner_id, created_at, status')
    .order('created_at', { ascending: false })

  // Get users for owner names (separate query to avoid relation issues)
  const { data: groupOwners } = await supabase
    .from('users')
    .select('id, name, email')

  // Get total participants
  const { count: participantsCount } = await supabase
    .from('participants')
    .select('*', { count: 'exact', head: true })

  // Get groups by status
  const { count: activeGroupsCount } = await supabase
    .from('groups')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const { count: completedGroupsCount } = await supabase
    .from('groups')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed')

  // Get user role and plan distribution
  const { data: userStats } = await supabase
    .from('users')
    .select('role, plan')

  const roleCounts = userStats?.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  const planCounts = userStats?.reduce((acc, user) => {
    const plan = user.plan || 'free'
    acc[plan] = (acc[plan] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  // Helper function to get owner info
  const getOwnerInfo = (ownerId: string) => {
    const owner = groupOwners?.find(u => u.id === ownerId)
    return owner ? (owner.name || owner.email) : 'N/A'
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Console Administrativo
        </h1>
        <p className="text-gray-400">
          Bem-vindo, {user.name || user.email} • Super Admin Console
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-2">
            Usuários Totais
          </h3>
          <p className="text-3xl font-bold text-green-400">
            {users?.length || 0}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Super: {roleCounts.super_admin || 0} • Admin: {roleCounts.admin || 0} • User: {roleCounts.user || 0}
          </p>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-2">
            Grupos Ativos
          </h3>
          <p className="text-3xl font-bold text-blue-400">
            {activeGroupsCount || 0}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Total: {groups?.length || 0}
          </p>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-2">
            Grupos Finalizados
          </h3>
          <p className="text-3xl font-bold text-purple-400">
            {completedGroupsCount || 0}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Taxa: {groups?.length ? Math.round((completedGroupsCount || 0) / groups.length * 100) : 0}%
          </p>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-2">
            Participantes
          </h3>
          <p className="text-3xl font-bold text-orange-400">
            {participantsCount || 0}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Média: {groups?.length ? Math.round((participantsCount || 0) / groups.length) : 0} por grupo
          </p>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-2">
            Planos
          </h3>
          <p className="text-3xl font-bold text-green-400">
            {planCounts.premium || 0}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Premium • Free: {planCounts.free || 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Users Table */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">
            Usuários Recentes
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 text-gray-400">Email</th>
                  <th className="text-left py-2 text-gray-400">Role</th>
                  <th className="text-left py-2 text-gray-400">Criado em</th>
                </tr>
              </thead>
              <tbody>
                {users?.slice(0, 5).map((user) => (
                  <tr key={user.id} className="border-b border-gray-700">
                    <td className="py-2 text-white">{user.email}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.role === 'super_admin' 
                          ? 'bg-red-600 text-white' 
                          : user.role === 'admin'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-gray-600 text-white'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-2 text-gray-400">
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Groups Table */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">
            Grupos Recentes
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 text-gray-400">Nome</th>
                  <th className="text-left py-2 text-gray-400">Dono</th>
                  <th className="text-left py-2 text-gray-400">Status</th>
                  <th className="text-left py-2 text-gray-400">Data</th>
                </tr>
              </thead>
              <tbody>
                {groups?.slice(0, 5).map((group) => (
                  <tr key={group.id} className="border-b border-gray-700">
                    <td className="py-2 text-white font-medium">{group.name}</td>
                    <td className="py-2 text-gray-300 text-sm">
                      {getOwnerInfo(group.owner_id)}
                    </td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        group.status === 'active' 
                          ? 'bg-green-600 text-white' 
                          : group.status === 'completed'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-600 text-white'
                      }`}>
                        {group.status}
                      </span>
                    </td>
                    <td className="py-2 text-gray-400 text-sm">
                      {new Date(group.created_at).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="mt-8 bg-gray-900 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-4">
          Status do Sistema
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-white font-medium mb-2">Console Admin</h4>
            <p className="text-green-400 text-sm">✓ Operacional</p>
            <p className="text-gray-400 text-xs">Sessão: {user.id.slice(0, 8)}...</p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-2">Database</h4>
            {usersError || groupsError ? (
              <p className="text-red-400 text-sm">✗ Erros detectados</p>
            ) : (
              <p className="text-green-400 text-sm">✓ Conectado</p>
            )}
            <p className="text-gray-400 text-xs">
              Última atualização: {new Date().toLocaleTimeString('pt-BR')}
            </p>
          </div>
        </div>
        
        {(usersError || groupsError) && (
          <div className="mt-4 p-4 bg-red-900/20 rounded border border-red-800">
            <h5 className="text-red-400 font-medium mb-2">Erros do Sistema</h5>
            {usersError && (
              <p className="text-red-400 text-sm">Usuários: {usersError.message}</p>
            )}
            {groupsError && (
              <p className="text-red-400 text-sm">Grupos: {groupsError.message}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}