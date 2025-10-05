import { useInboxHidden, usePrivateChatAccount } from '../zustand/usePrivateChat'
import { X } from 'lucide-react'
import Chat from './chat'
import { useEffect, RefObject } from 'react'
import { collection,onSnapshot,query,orderBy, DocumentData,limit, QueryDocumentSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuthContext } from '../context/authContext'
import PrivateMessages from './PrivateMessages'
import { INITIAL_MESSAGE_LENGTH } from '../collections/constants'

interface PrivateChatProps {
  setLastDocPrivate:React.Dispatch<React.SetStateAction<QueryDocumentSnapshot<DocumentData>|null>>;
  msgs:DocumentData[];
  setMsgs:React.Dispatch<React.SetStateAction<DocumentData[]>>;
  loadingMorePrivate:boolean; 
  bottomRef:RefObject<HTMLDivElement|null>;
  privateChatContainerRef:RefObject<HTMLDivElement|null>;
  handleScrollPrivate:()=>Promise<void>
}

const PrivateChat = ({setLastDocPrivate,msgs,setMsgs,loadingMorePrivate,bottomRef,
                      privateChatContainerRef,handleScrollPrivate}:PrivateChatProps) => {
// @ts-expect-error
  const {setInboxHidden} = useInboxHidden()
// @ts-expect-error
  const {privateChatAccount} = usePrivateChatAccount()
// @ts-expect-error
  const {user} = useAuthContext()

  const handleClose = () => {
    setInboxHidden(true)
  }
  useEffect(()=>{
    if (!privateChatAccount.email) return
    const [first,second] = [privateChatAccount.email,user.email].sort()
    const chatId = first+'_'+second
    const messageRef = collection(db,'chat',chatId,'messages')
    const q = query(
      messageRef,
      orderBy('timestamp','desc'),
      limit(INITIAL_MESSAGE_LENGTH)
    )

    const ss = onSnapshot(q,(snapshot)=>{
      setMsgs((snapshot.docs.map((doc) => doc.data()).reverse()))
      const lastDoc = snapshot.docs[snapshot.docs.length - 1]
      setLastDocPrivate(lastDoc)
    })
    return ()=>{
      ss()
    }
  },[privateChatAccount.email])
    return <>
    <div className="p-1 flex justify-between bg-slate-600 shadow-slate-700 shadow z-10">
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
    <div className="border-t-gray-400 flex-1 overflow-y-auto" ref={privateChatContainerRef} onScroll={handleScrollPrivate}>
     <PrivateMessages msgs={msgs} photoURL={privateChatAccount.photoURL} name={privateChatAccount.name}
      loadingMorePrivate={loadingMorePrivate} bottomRef={bottomRef}/> 
    </div>
    <Chat typeOfChat="private" receiver={privateChatAccount.email}/>
  </>
}
export default PrivateChat
