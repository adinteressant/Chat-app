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

  return <div className="flex flex-col">
  {Msgs.map((message,index) =>{
    let position:string
    const fromMe:boolean = message.sender===user.email
    if(fromMe){
      position = 'justify-end' 
    }else{
      position = 'justify-start'
    }
    return (
      <div key={index} className={`flex gap-1 ${position}`}>
      {!fromMe &&
        <div>
          {message.sender.split('@')[0]}
        </div>}
        <div>
          {message.message}
        </div>
      </div>
    )
  })} 
  </div> 
}

export default Messages
