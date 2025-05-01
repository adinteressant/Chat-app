import { signOut } from 'firebase/auth'
import { useAuthContext } from '../context/authContext'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../firebase'
import Chat from './chat'
import Messages from './messages'

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
  
    return <div className="p-2">
    <div className="flex gap-1 items-center">
      <div>
        <img src={auth.currentUser.photoURL} alt="photo" className="rounded-full w-10 h-10"/>
      </div>
      <div>{user.displayName}</div>
    </div>

      <div>
        <button className="border cursor-pointer" onClick={handleLogout}>logout</button>
      </div>

      <div className="border m-2 flex flex-col">
        <Messages/>
        <Chat/>
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
