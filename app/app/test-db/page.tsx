import { createClient } from '@/utils/supabase/server'

export default async function TestDbPage() {
  const supabase = await createClient()

  // Test if users table exists
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .limit(5)

  // Test if groups table exists  
  const { data: groups, error: groupsError } = await supabase
    .from('groups')
    .select('*')
    .limit(5)

  // Test if participants table exists
  const { data: participants, error: participantsError } = await supabase
    .from('participants')
    .select('*')
    .limit(5)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Test Database Tables</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-white mb-4">Users Table</h2>
          {usersError ? (
            <p className="text-red-400">Error: {usersError.message}</p>
          ) : (
            <pre className="text-sm text-gray-300 overflow-auto">
              {JSON.stringify(users, null, 2)}
            </pre>
          )}
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-white mb-4">Groups Table</h2>
          {groupsError ? (
            <p className="text-red-400">Error: {groupsError.message}</p>
          ) : (
            <pre className="text-sm text-gray-300 overflow-auto">
              {JSON.stringify(groups, null, 2)}
            </pre>
          )}
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-white mb-4">Participants Table</h2>
          {participantsError ? (
            <p className="text-red-400">Error: {participantsError.message}</p>
          ) : (
            <pre className="text-sm text-gray-300 overflow-auto">
              {JSON.stringify(participants, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}