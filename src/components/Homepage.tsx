import { signOut } from 'firebase/auth'
import { useAuthContext } from '../context/authContext'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../firebase'

const Homepage = () => {
  const navigate = useNavigate()
  const {user,setUser,loading} = useAuthContext()
  const handleLogout = async ():Promise<void> =>{
    try{
      await signOut(auth)
      setUser({
        displayName:'',
        email:''
      })
      navigate('/login')
    }catch(err){
      console.log(err)
    }
  }
  if(user.displayName && !loading){
  
    return <div>
      <div>welcome {user.displayName}</div>
      <div>
        <img src={auth.currentUser.photoURL} alt="photo"/>
      </div>


      <div>
        <button className="border cursor-pointer" onClick={handleLogout}>logout</button>
      </div>
    </div>
  }
  if(loading){
    return <div>Loading...</div>
  }
  return <div>

  you need to <Link to={'/login'} className="text-blue-500">login</Link> first.</div>
}


export default Homepage
