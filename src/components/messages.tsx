import { RefObject, useEffect, useState } from 'react'
import { db } from '../firebase'
import { collection, onSnapshot, orderBy, query,DocumentData, limit, QueryDocumentSnapshot} from 'firebase/firestore'
import { useAuthContext } from '../context/authContext'
import UserProfile from './UserProfile'
import { getDocs,where,or } from 'firebase/firestore'
import { FriendStatus } from '../collections/types'
import { FriendReqStatus } from '../collections/enums'
import { Loader2 } from 'lucide-react'
import { INITIAL_MESSAGE_LENGTH } from '../collections/constants'
interface MessageProp {
  setNotificationHidden:React.Dispatch<React.SetStateAction<boolean>>;
  notificationHidden:boolean;
  setLastDoc:React.Dispatch<React.SetStateAction<QueryDocumentSnapshot<DocumentData>|null>>;
  Msgs:DocumentData[];
  setMsgs:React.Dispatch<React.SetStateAction<DocumentData[]>>;
  loadingMore:boolean;
  bottomRef:RefObject<HTMLDivElement|null>;
}
const Messages = ({setNotificationHidden,notificationHidden,setLastDoc,Msgs,setMsgs,loadingMore,bottomRef}:MessageProp) => {
  const [friendStatus,setFriendStatus] = useState<FriendStatus[]>([])
  const {user} = useAuthContext()
  let firstLoad = true
  useEffect(()=>{
    const messageRef = collection(db,'chat','global','messages')
    const q = query(messageRef,orderBy('timestamp','desc'),limit(INITIAL_MESSAGE_LENGTH))

    const ss = onSnapshot(q,(snapshot)=>{
      setMsgs(snapshot.docs.map((doc) => doc.data()).reverse())
      const lastDoc = snapshot.docs[snapshot.docs.length - 1]
      setLastDoc(lastDoc)
    })

    const friendsRef = collection(db,'chat','global','friends')
    const qry = query(friendsRef)
    const unsubscribe = onSnapshot(qry,(snapshot)=>{
      let user1,user2
      const users:string[] = []
      snapshot.docChanges().forEach((change) => {
        user1 = change.doc.data().sender
        users.push(user1)
        user2 = change.doc.data().receiver
        users.push(user2)
      })
      if(firstLoad){
        firstLoad=false
        return
      }
      if(users.includes(user.email)){
        setNotificationHidden(false)
      }
    })

    return ()=>{
    ss()
    unsubscribe()
    }
  },[])
  

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
    {loadingMore &&
      <div className="flex justify-center">
      <Loader2 className="animate-spin w-8 h-8 text-slate-300"/>
    </div>}
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
      <div key={index} className={`flex gap-1 items-end ${position} flex-1 p-2`}>
      {!fromMe &&
        <div className="group relative">
          <div className="w-10">
            <img className="w-10 h-10 rounded-full cursor-pointer" src={message.imageURL} alt="photo"/>
          </div>
          <div className="hidden group-hover:block absolute rounded-md w-42 h-32 bg-white z-10">
            <UserProfile message={message} notificationHidden={notificationHidden}
                  friendReqStatus={friendReqStatus}/>  
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
