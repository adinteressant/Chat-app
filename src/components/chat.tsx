import { addDoc,collection, serverTimestamp } from 'firebase/firestore'
import { useState } from 'react'
import { db } from '../firebase'
import { useAuthContext } from '../context/authContext'
const Chat = () => {
  const {user} = useAuthContext()
  const [message,setMessage] = useState<string>('')
  const handleSend = async ():Promise<void> => {
    if(!message.trim()) return 
    await addDoc(collection(db,'chat','global','messages'),{
      message:message.trim(),
      sender:user.email,
      timestamp: serverTimestamp()
    })
    setMessage('')
  }
  return <div className="p-2 flex gap-1">
    <input type="text" name="message" value={message} className="border"
    onChange={(e:React.ChangeEvent<HTMLInputElement>):void=>{setMessage(e.target.value)}}/>
    <button onClick={handleSend} className="cursor-pointer border">Send</button> 
    </div>
}

export default Chat
