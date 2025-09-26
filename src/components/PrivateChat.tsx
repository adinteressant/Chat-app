import { useInboxHidden, usePrivateChatAccount } from '../zustand/usePrivateChat'
import { X } from 'lucide-react'
import Chat from './chat'
import { useState,useEffect } from 'react'
import { collection,onSnapshot,query,orderBy, DocumentData,where } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuthContext } from '../context/authContext'
import PrivateMessages from './PrivateMessages'
const PrivateChat = () => {
  const {setInboxHidden} = useInboxHidden()
  const {privateChatAccount} = usePrivateChatAccount()
  const {user} = useAuthContext()

  const handleClose = () => {
    setInboxHidden(true)
  }
  const [msgs,setMsgs] = useState<DocumentData[]>([])
  useEffect(()=>{
    if (!privateChatAccount.email) return
    const [first,second] = [privateChatAccount.email,user.email].sort()
    const chatId = first+'_'+second
    const messageRef = collection(db,'chat',chatId,'messages')
    const q = query(
      messageRef,
      orderBy("timestamp")
    )

    const ss = onSnapshot(q,(snapshot)=>{
      setMsgs(snapshot.docs.map((doc) => doc.data()))
    })
    return ()=>{
      ss()
    }
  },[privateChatAccount.email])
    return <div className=" flex flex-col h-full text-slate-200 relative">
    <div className=" flex-1 flex justify-between bg-slate-600 shadow-slate-700 shadow sticky top-0 p-1 z-10">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10">
          <img src={privateChatAccount.photoURL} className="w-10 h-10 rounded-full" alt="photo"/>
        </div>
        <div>{privateChatAccount.name}</div>
      </div>
      <div className="w-10 flex justify-center items-center">
        <X className="cursor-pointer" onClick={handleClose}/> 
      </div> 
    </div>
    <div className="border-t-gray-400 flex-15">
     <PrivateMessages msgs={msgs} photoURL={privateChatAccount.photoURL} name={privateChatAccount.name}/> 
    </div>
    <Chat typeOfChat="private" receiver={privateChatAccount.email}/>
  </div>
}
export default PrivateChat
