import { signInWithPopup } from 'firebase/auth'
import { auth,googleProvider } from '../firebase'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../context/authContext'
const Loginpage = () => {
  const {user,loading} = useAuthContext() 
  const navigate = useNavigate()
  const handleLogin = async ():Promise<void> =>{
    try{
      await signInWithPopup(auth,googleProvider)
      navigate('/home') 
    }catch(err){
      console.log(err)
    }
  }
  if(user.displayName && !loading){
    navigate('/home')
    return
  }
  if(loading){
    return <div>Loading...</div>
  }
  return <div className="flex justify-center items-center h-screen w-full">
  <button 
    onClick={handleLogin}
  className="border cursor-pointer p-1">
    sign in with google

  </button>
  </div>
}


export default Loginpage
