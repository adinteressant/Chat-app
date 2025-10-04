import { DocumentData } from 'firebase/firestore'
import { useAuthContext } from '../context/authContext'
import { RefObject, useEffect } from 'react'
import { decryptMessage } from '../utils/encryptDecrypt';
import { Loader2 } from 'lucide-react';
interface PrivateMessageProps {
  msgs:DocumentData[];
  photoURL:string;
  name:string;
  loadingMorePrivate:boolean;
  bottomRef:RefObject<HTMLDivElement|null>;
}
const PrivateMessages = ({msgs,photoURL,name,loadingMorePrivate,bottomRef}:PrivateMessageProps) => {
const {user} = useAuthContext()

return <div className="flex flex-col gap-2">
    {loadingMorePrivate &&
      <div className="flex justify-center">
      <Loader2 className="animate-spin w-8 h-8 text-slate-300"/>
    </div>}
  {msgs.map((message,index) =>{
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
      <div key={index} className={`flex gap-1 items-end ${position} flex-1 p-2`}>
      {!fromMe &&
        <div className="group relative">
          <div className="w-10">
            <img className="w-10 h-10 rounded-full cursor-pointer" src={photoURL} alt="photo"/>
          </div>
        </div>}
        <div className="flex flex-col">
        {!fromMe && <div className="text-slate-200 text-sm">{name.split(' ')[1] || name}</div>}
        <div className={`${backgroundColor} p-2 rounded-xl text-slate-50`}>
          {decryptMessage(message.message)}
        </div>
        </div>
      </div>
    )
  })} 
   <div ref={bottomRef}></div> 
  </div> 

}

export default PrivateMessages
