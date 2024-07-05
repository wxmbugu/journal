import React, { createContext, useContext } from 'react'
import { useStorageState } from './usestoragestate'

const AuthContext = createContext<{
  signIn: (token: any) => void
  signOut: () => void
  session?: any | null
  isLoading: boolean
}>({
  signIn: () => null,
  signOut: () => null,
  session: null,
  isLoading: false,
})

// This hook can be used to access the user info.
export function useSession() {
  const value = useContext(AuthContext)
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error('useSession must be wrapped in a <SessionProvider />')
    }
  }

  return value
}
export function SessionProvider(props: React.PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState('session')
  return (
    <AuthContext.Provider
      value={{
        signIn: (token) => {
          // Add your login logic here
          // For example purposes, we'll just set a fake session in storage
          //This likely would be a JWT token or other session data
          setSession(token)
        },
        signOut: () => {
          setSession(null)
        },
        session,
        isLoading,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  )
}
