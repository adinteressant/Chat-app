import { createContext,useContext,useEffect,useState } from 'react'
import { auth } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'
type User = {
  displayName:string,
  email:string
}
type UserContext = {
  user:User,
  setUser:React.Dispatch<React.SetStateAction<User>>,
  loading:boolean
}
export const AuthContext = createContext<UserContext|null>(null)
export const useAuthContext = ():UserContext|null =>{
   return useContext(AuthContext)
}

export const AuthContextProvider = ({children}:{children:React.ReactNode}) => {
const [user,setUser] = useState<User>({
  displayName:'',
  email:''
})
const [loading,setLoading] = useState<boolean>(true)
useEffect(()=>{
      const ss = onAuthStateChanged(auth,currUser=>{
        setUser({
          displayName:currUser?.displayName || '',
          email:currUser?.email || ''
        })
        setLoading(false)
    })
    return ()=>ss()

},[])

  return <AuthContext.Provider value={{user,setUser,loading}}>
    {children}
  </AuthContext.Provider>
}
