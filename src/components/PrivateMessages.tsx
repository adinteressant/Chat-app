import { DocumentData } from 'firebase/firestore'
import { useAuthContext } from '../context/authContext'
import { useEffect, useRef } from 'react'
interface PrivateMessageProps {
  msgs:DocumentData[];
  photoURL:string;
  name:string;
}
const PrivateMessages = ({msgs,photoURL,name}:PrivateMessageProps) => {
const {user} = useAuthContext()
const bottomRef = useRef<HTMLDivElement|null>(null)

useEffect(()=>{
  bottomRef.current?.scrollIntoView({behavior:'smooth'})
},[msgs])
return <div className="flex flex-col gap-2">
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
        {!fromMe && <div className="text-slate-200 text-sm">{name.split(' ')[1]}</div>}
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

export default PrivateMessages
