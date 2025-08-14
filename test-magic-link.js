import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fnemwtlabryefecprety.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuZW13dGxhYnJ5ZWZlY3ByZXR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxODk5MzgsImV4cCI6MjA3MDc2NTkzOH0.QhUrG0hRy8SI2vbzEIk8SxFWcoNlZC11o-qKiYkar5I'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testMagicLink() {
  console.log('🧪 Testando magic link...')
  
  const { data, error } = await supabase.auth.signInWithOtp({
    email: 'test@example.com',
    options: {
      emailRedirectTo: 'http://localhost:3000/auth/confirm',
    },
  })

  console.log('Resultado:')
  console.log('- Data:', data)
  console.log('- Error:', error)
  
  if (error) {
    console.log('❌ Falhou:', error.message)
  } else {
    console.log('✅ Sucesso!')
  }
}

testMagicLink()