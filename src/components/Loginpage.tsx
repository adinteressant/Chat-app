import { signInWithPopup } from 'firebase/auth'
import { auth,db,googleProvider } from '../firebase'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../context/authContext'
import { setDoc, doc } from 'firebase/firestore'
const Loginpage = () => {
  const {user,loading} = useAuthContext() 
  const navigate = useNavigate()
  const handleLogin = async ():Promise<void> =>{
    try{
      const authUser = await signInWithPopup(auth,googleProvider)
      await setDoc(
      doc(db, 'users', authUser.user.uid),
      {
        email: authUser.user.email,
        displayName: authUser.user.displayName,
        photoURL: authUser.user.photoURL,
      },
      { merge: true } // update if exists, otherwise create
    )
    }catch(err){
      console.log(err)
    }finally{
      navigate('/home')
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
  className="border cursor-pointer p-1 flex gap-1 items-center">
      <div><img src="images/googleLogo.png" alt="logo" className="w-7 h-7"/></div>
      <div>Sign In with Google</div>
    
  </button>
  </div>
}


export default Loginpage
