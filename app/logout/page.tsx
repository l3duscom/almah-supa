import { signOut } from './actions'

export default async function LogoutPage() {
  // Automatically sign out when this page is accessed
  await signOut()
  
  // This return won't be reached due to redirect in signOut
  return null
}