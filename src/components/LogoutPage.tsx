import { useEffect } from 'react'
import { useAuthContext } from '../context/authContext'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
const LogoutPage = () => {
  //@ts-expect-error
  const {setUser} = useAuthContext()
  useEffect(()=>{
    const logout = async ():Promise<void> => {
      try{
        await signOut(auth)
        setUser({
          displayName:'',
          email:'',
          photoURL:''
        })
        window.location.href='/login' 
      }catch(err){
        console.error(err)
      }
    }
    logout()
  },[])

  return <div></div>
}

export default LogoutPage
