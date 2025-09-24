import { useEffect, useRef, useState } from 'react'
import { db } from '../firebase'
import { collection, onSnapshot, orderBy, query,DocumentData } from 'firebase/firestore'
import { useAuthContext } from '../context/authContext'
import UserProfile from './UserProfile'
import { getDocs,where,or } from 'firebase/firestore'
import { FriendStatus } from '../collections/types'
import { FriendReqStatus } from '../collections/enums'
const Messages = () => {
  const [Msgs,setMsgs] = useState<DocumentData[]>([])
  const [friendStatus,setFriendStatus] = useState<FriendStatus[]>([])
  const {user} = useAuthContext()
  const bottomRef = useRef<HTMLDivElement|null>(null);
  useEffect(()=>{
    const messageRef = collection(db,'chat','global','messages')
    const q = query(messageRef,orderBy('timestamp'))

    const ss = onSnapshot(q,(snapshot)=>{
      setMsgs(snapshot.docs.map((doc) => doc.data()))
    })

    return ()=>ss()
  },[])

  useEffect(()=>{
    bottomRef.current?.scrollIntoView({behavior:'smooth'})
  },[Msgs])
  useEffect(()=>{
    const getFriendStatus = async():Promise<void> => {
      try{
        let messageQuery = query(collection(db,'chat','global','friends'),
        or(
        where('sender','==',user.email),
        where('receiver','==',user.email)
        )
        )
        const snapshot = await getDocs(messageQuery)
        const status = snapshot.docs.map(doc =>({
          id: doc.id,
          ...doc.data(),
        }))
        setFriendStatus(status)
      }catch(err){
        console.error(err)
      }
    }
    getFriendStatus()
  },[])

  return <div className="flex flex-col gap-2">
  {Msgs.map((message,index) =>{
    let position:string
    let backgroundColor:string
    const fromMe:boolean = message.sender===user.email
    if(fromMe){
      position = 'justify-end'
      backgroundColor = 'bg-cyan-600'
    }else{
      position = 'justify-start'
      backgroundColor = 'bg-slate-400'
    }

    let friendReqStatus:FriendReqStatus = FriendReqStatus.NotFriend
    for(const status of friendStatus){
      if(!fromMe && (message.sender == status.sender || message.sender == status.receiver)){
        if (user.email == status.sender){
          if(status.status == 'pending') friendReqStatus = FriendReqStatus.RequestSent
          else friendReqStatus = FriendReqStatus.Friend
          break
        }else if(user.email == status.receiver){
          if(status.status == 'pending') friendReqStatus = FriendReqStatus.RequestReceived
          else friendReqStatus = FriendReqStatus.Friend
          break
        }
      }
    }

    return (
      <div key={index} className={`flex gap-1 items-end ${position} flex-1`}>
      {!fromMe &&
        <div className="group relative">
          <img className="w-10 h-10 rounded-full cursor-pointer" src={message.imageURL} alt="photo"/>
          <div className="hidden group-hover:block absolute rounded-md w-42 h-32 bg-white z-10">
            <UserProfile message={message} friendReqStatus={friendReqStatus}/>  
          </div>
        </div>}
        <div className="flex flex-col">
        {!fromMe && <div className="text-slate-200 text-sm">{message.senderName.split(' ')[1]}</div>}
        <div className={`${backgroundColor} p-2 rounded-xl text-slate-50`}>
          {message.message}
        </div>
        </div>
      </div>
    )
  })} 
    <div ref={bottomRef}></div>
  </div> 
}

export default Messages
