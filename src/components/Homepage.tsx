import { signOut } from 'firebase/auth'
import { useAuthContext } from '../context/authContext'
import { Link, useLocation } from 'react-router-dom'
import { auth } from '../firebase'
import Chat from './chat'
import Messages from './messages'
import PrivateChat from './PrivateChat'
import { useState } from 'react'
import { useInboxHidden } from '../zustand/usePrivateChat'

const Homepage = () => {
  const {user,setUser,loading} = useAuthContext()
  const location = useLocation()
  const [notificationHidden,setNotificationHidden] = useState<boolean>(true)

  const {inboxHidden} = useInboxHidden()

  const handleLogout = async ():Promise<void> =>{
    try{
      await signOut(auth)
      setUser({
        displayName:'',
        email:''
      })
      window.location.href='/login' 
    }catch(err){
      console.log(err)
    }
  }
  const refreshPage = () => {
    setNotificationHidden(true)
    window.location.href = location.pathname
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
      <div className="w-xl relative">
        <div className="m-2 flex flex-col bg-slate-600 p-0 w-xl fixed overflow-y-auto top-16 bottom-2 rounded-md">
          <div className={`${notificationHidden && `hidden`} sticky p-1 z-50 w-full bg-amber-400 top-0 left-0 text-amber-800`}>
            Content has been updated.
            <span className="underline text-cyan-800 cursor-pointer" 
              onClick={refreshPage}>Refresh</span> to view latest content.
          </div>
          <Messages  setNotificationHidden={setNotificationHidden} notificationHidden={notificationHidden}/>
          <Chat typeOfChat="global"/>
        </div>
        <div className={`${(inboxHidden || !notificationHidden) &&`hidden`} m-2 fixed left-[40rem] bg-slate-600 p-0 w-xl overflow-y-auto top-16
          bottom-2 rounded-md`}>
          <PrivateChat/>  
        </div>
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
