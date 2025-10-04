import { addDoc,collection, serverTimestamp,updateDoc,doc } from 'firebase/firestore'
import { useState } from 'react'
import { db } from '../firebase'
import { useAuthContext } from '../context/authContext'
import { auth } from '../firebase'
import { encryptMessage } from '../utils/encryptDecrypt'
interface ChatProps {
  typeOfChat:string;
  receiver?:string;
}
const Chat = ({typeOfChat,receiver=''}:ChatProps) => {
// @ts-expect-error
  const {user} = useAuthContext()
  const [message,setMessage] = useState<string>('')
  const handleSend = async ():Promise<void> => {
    if(!message.trim()) return
    setMessage('')
    if(typeOfChat=='global'){
      await addDoc(collection(db,'chat','global','messages'),{
        message:message.trim(),
        sender:user.email,
        senderName:user.displayName,
        imageURL:auth.currentUser?.photoURL || '',
        timestamp: serverTimestamp()
      })
    }else{
      const [first,second] = [user.email,receiver].sort()
      const chatId = first+'_'+second
      
      const ts = serverTimestamp()
      await addDoc(collection(db,'chat',chatId,'messages'),{
        sender:user.email,
        receiver,
        message:encryptMessage(message.trim()),
        timestamp: ts
      })
      
      const docRef = doc(db, 'chat', 'global', 'friends2',chatId);
      await updateDoc(docRef, {
        latestMessageAt: ts
      })
    }
  }
  return <div className="p-2 flex gap-1 sticky w-xl bottom-4">
    <input type="text" name="message" value={message}
      placeholder="Send a message"
    className="p-1.5 flex-grow rounded-md bg-slate-100 text-slate-950"
    onChange={(e:React.ChangeEvent<HTMLInputElement>):void=>{setMessage(e.target.value)}}/>
    <button onClick={handleSend} className="cursor-pointer bg-cyan-600 p-1.5 hover:bg-cyan-700
    text-slate-50 rounded-md">Send</button> 
    </div>
}

export default Chat
