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
        <img src={user.photoURL} alt="photo" className="rounded-full w-10 h-10"/>
      </div>
      <div>{user.displayName}</div>
    

      <div>
        <button className="p-1.5 hover:bg-cyan-700
        text-slate-50 bg-cyan-600 rounded-md cursor-pointer" onClick={handleLogout}>Logout</button>
      </div>
    </div>
    <div className="w-xl">
      <div className="m-2 pb-16 flex flex-col bg-slate-600 p-2 w-xl fixed overflow-y-auto top-16 bottom-2 rounded-md">
        <Messages/>
      </div>
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
