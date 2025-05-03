import { useEffect, useState } from 'react'
import { db } from '../firebase'
import { collection, onSnapshot, orderBy, query,DocumentData } from 'firebase/firestore'
import { useAuthContext } from '../context/authContext'

const Messages = () => {
  const [Msgs,setMsgs] = useState<DocumentData[]>([])
  const {user} = useAuthContext()

  useEffect(()=>{
    const messageRef = collection(db,'chat','global','messages')
    const q = query(messageRef,orderBy('timestamp'))

    const ss = onSnapshot(q,(snapshot)=>{
      setMsgs(snapshot.docs.map((doc) => doc.data()))
    })

    return ()=>ss()
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
    return (
      <div key={index} className={`flex gap-1 items-end ${position} flex-1`}>
      {!fromMe &&
        <div>
          <img className="w-10 h-10 rounded-full" src={message.imageURL} alt="photo"/>     
        </div>}
        <div className="flex flex-col">
        {!fromMe && <div className="text-slate-200 text-sm">{message.sender.split('@')[0]}</div>}
        <div className={`${backgroundColor} p-2 rounded-xl text-slate-50`}>
          {message.message}
        </div>
        </div>
      </div>
    )
  })} 
  </div> 
}

export default Messages
