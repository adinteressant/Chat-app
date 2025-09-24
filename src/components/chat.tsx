import { addDoc,collection, serverTimestamp } from 'firebase/firestore'
import { useState } from 'react'
import { db } from '../firebase'
import { useAuthContext } from '../context/authContext'
import { auth } from '../firebase'
const Chat = () => {
  const {user} = useAuthContext()
  const [message,setMessage] = useState<string>('')
  const handleSend = async ():Promise<void> => {
    if(!message.trim()) return 
    setMessage('')
    await addDoc(collection(db,'chat','global','messages'),{
      message:message.trim(),
      sender:user.email,
      senderName:user.displayName,
      imageURL:auth.currentUser?.photoURL || '',
      timestamp: serverTimestamp()
    })
  }
  return <div className="p-2 flex gap-1 fixed bottom-4 w-xl left-3">
    <input type="text" name="message" value={message}
      placeholder="Send a message"
    className="p-1.5 flex-grow rounded-md bg-slate-100"
    onChange={(e:React.ChangeEvent<HTMLInputElement>):void=>{setMessage(e.target.value)}}/>
    <button onClick={handleSend} className="cursor-pointer bg-cyan-600 p-1.5 hover:bg-cyan-700
    text-slate-50 rounded-md">Send</button> 
    </div>
}

export default Chat
