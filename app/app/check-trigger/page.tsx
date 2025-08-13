import { createClient } from '@/utils/supabase/server'

export default async function CheckTriggerPage() {
  const supabase = await createClient()

  // Get current user from auth
  const { data: { user: authUser } } = await supabase.auth.getUser()

  // Try to get user from public.users
  const { data: publicUser, error: publicUserError } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser?.id)
    .single()

  // Get all users from public.users
  const { data: allPublicUsers, error: allUsersError } = await supabase
    .from('users')
    .select('*')

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Check Trigger Status</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-white mb-4">Auth User</h2>
          <pre className="text-sm text-gray-300 overflow-auto">
            {JSON.stringify(authUser, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-white mb-4">Public User</h2>
          {publicUserError ? (
            <p className="text-red-400">Error: {publicUserError.message}</p>
          ) : (
            <pre className="text-sm text-gray-300 overflow-auto">
              {JSON.stringify(publicUser, null, 2)}
            </pre>
          )}
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-white mb-4">All Public Users</h2>
          {allUsersError ? (
            <p className="text-red-400">Error: {allUsersError.message}</p>
          ) : (
            <pre className="text-sm text-gray-300 overflow-auto">
              {JSON.stringify(allPublicUsers, null, 2)}
            </pre>
          )}
        </div>

        {authUser && !publicUser && (
          <div className="bg-red-900/20 p-6 rounded-lg border border-red-800">
            <h3 className="text-red-400 font-semibold mb-2">Trigger Issue Detected</h3>
            <p className="text-red-300 mb-4">
              User exists in auth.users but not in public.users. The trigger may not be working.
            </p>
            <p className="text-gray-300 text-sm">
              User ID: {authUser.id}<br/>
              Email: {authUser.email}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}