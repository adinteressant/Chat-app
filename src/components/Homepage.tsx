import { signOut } from 'firebase/auth'
import { useAuthContext } from '../context/authContext'
import { Link, useLocation } from 'react-router-dom'
import { auth, db } from '../firebase'
import Chat from './chat'
import Messages from './messages'
import PrivateChat from './PrivateChat'
import { useEffect, useRef, useState } from 'react'
import { useInboxHidden, usePrivateChatAccount } from '../zustand/usePrivateChat'
import AuthUserInfo from './AuthUserInfo'
import { useFriends } from '../zustand/useGetFriends'
import { User } from '../collections/types'
import { handleFriendReq } from '../utils/handleFriendReq'
import { QueryDocumentSnapshot,DocumentData, collection, query, orderBy, startAfter, limit, getDocs } from 'firebase/firestore'
import { MORE_MESSAGE_LENGTH } from '../collections/constants'
import FriendsModal from './FriendsModal'
const Homepage = () => {
// @ts-expect-error
  const {user,setUser,loading} = useAuthContext()
  const location = useLocation()
  const [notificationHidden,setNotificationHidden] = useState<boolean>(true)
  const [isInboxModalOpen,setIsInboxModalOpen] = useState<boolean>(false)
  const [operationLoading,setOperationLoading] = useState<boolean>(false)
// @ts-expect-error
  const {inboxHidden,setInboxHidden} = useInboxHidden()
// @ts-expect-error
  const {friends} = useFriends()
// @ts-expect-error
  const {setPrivateChatAccount} = usePrivateChatAccount()
  const chatContainerRef = useRef<HTMLDivElement|null>(null)
  const privateChatContainerRef = useRef<HTMLDivElement|null>(null)
  const bottomRef = useRef<HTMLDivElement|null>(null)
  const bottomRefPrivate = useRef<HTMLDivElement|null>(null)
  const [loadingMore,setLoadingMore] = useState<boolean>(false)
  const [loadingMorePrivate,setLoadingMorePrivate] = useState<boolean>(false)
  const [lastDoc,setLastDoc] = useState<QueryDocumentSnapshot<DocumentData>|null>(null)
  const [lastDocPrivate,setLastDocPrivate] = useState<QueryDocumentSnapshot<DocumentData>|null>(null)
  const [Msgs,setMsgs] = useState<DocumentData[]>([])
  const [privateMsgs,setPrivateMsgs] = useState<DocumentData[]>([])
// @ts-expect-error
  const {privateChatAccount} = usePrivateChatAccount()

  const refreshPage = ():void => {
    setNotificationHidden(true)
    window.location.href = location.pathname
  } 

  const handleMessage = (friend:User) => {
    setPrivateChatAccount({
      name:friend.displayName,
      ...friend
    })
    setInboxHidden(false)
    setIsInboxModalOpen(false)
  }
  
  const handleAcceptRequest = (reqSender:string) => {
    handleFriendReq('accept',reqSender,user.email,setOperationLoading,refreshPage)
  }
  
  const handleDeleteRequest = (reqSender:string) => {
    handleFriendReq('delete',reqSender,user.email,setOperationLoading,refreshPage)
  }

  const handleScroll = async () => {
    if (!chatContainerRef.current || loadingMore) return;
    if (chatContainerRef.current.scrollTop === 0 && lastDoc) {
      setLoadingMore(true)
      const { messages: olderMessages, lastDoc: newLastDoc } = await getMoreMessages(lastDoc)
      setMsgs(prev => [...olderMessages, ...prev])
      setLastDoc(newLastDoc || null)
      setLoadingMore(false)
    }
  }

  const handleScrollPrivate = async () => {
    if(!privateChatContainerRef.current || loadingMorePrivate) return;
    
    const [first,second] = [user.email,privateChatAccount.email].sort()
    const chatId = first+'_'+second
    if(privateChatContainerRef.current.scrollTop === 0 && lastDocPrivate){
      setLoadingMorePrivate(true)
      const {messages:olderMessages,lastDoc:newLastDoc} = await getMoreMessagesPrivate(lastDocPrivate,chatId)
      setPrivateMsgs(prev => [...olderMessages,...prev])
      setLastDocPrivate(newLastDoc||null)
      setLoadingMorePrivate(false)
    }
  }

  useEffect(()=>{
    const scrollToBottom = () => {

      if (!chatContainerRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;

      const isNearBottom = scrollHeight - scrollTop - clientHeight < 50; 
      // tweak 50px threshold as you like

      if (isNearBottom) {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
    scrollToBottom()
  },[Msgs])
  useEffect(()=>{
    const scrollToBottom = () => {

      if (!privateChatContainerRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = privateChatContainerRef.current;

      const isNearBottom = scrollHeight - scrollTop - clientHeight < 50; 
      // tweak 50px threshold as you like

      if (isNearBottom) {
        bottomRefPrivate.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
    scrollToBottom()
  },[privateMsgs])
  const getMoreMessages = async (lastDoc:QueryDocumentSnapshot<DocumentData>) => {
    const messagesRef = collection(db, 'chat','global','messages')
    const q = query(
      messagesRef,
      orderBy("timestamp", "desc"),
      startAfter(lastDoc),
      limit(MORE_MESSAGE_LENGTH)
    )
    const snapshot = await getDocs(q)

    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    const newLastDoc = snapshot.docs[snapshot.docs.length - 1]

    return { messages: messages.reverse(), lastDoc: newLastDoc }
  }
  const getMoreMessagesPrivate = async (lastDoc:QueryDocumentSnapshot<DocumentData>,chatId:string) => {
    const messageRef = collection(db,'chat',chatId,'messages')
    const q = query(
      messageRef,
      orderBy('timestamp','desc'),
      startAfter(lastDoc),
      limit(MORE_MESSAGE_LENGTH)
    )
    const snapshot = await getDocs(q)
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    const newLastDoc = snapshot.docs[snapshot.docs.length - 1]

    return {messages:messages.reverse(),lastDoc:newLastDoc}
  }

  if(user.displayName && !loading){
  
    return <div className="p-2 pb-14 flex flex-col h-screen">

      {/*auth user information*/}
      <AuthUserInfo setIsInboxModalOpen={setIsInboxModalOpen}/> 
      
      <div className="flex gap-10 p-2 h-full">
      
        {/*group chat section*/}
      <div className={`flex-1 bg-slate-600 rounded-md flex flex-col h-full`}>
          <div className={`${notificationHidden && `hidden`} p-2 z-50 w-full bg-amber-400 text-amber-800`}>
            Content has been updated.
            <span className="underline text-cyan-800 cursor-pointer" 
            onClick={refreshPage}>Refresh</span> to view latest content.
          </div>

          <div className="flex-1 overflow-y-auto" onScroll={handleScroll} ref={chatContainerRef}>
            <Messages  setNotificationHidden={setNotificationHidden} notificationHidden={notificationHidden}
            setLastDoc={setLastDoc} Msgs={Msgs} setMsgs={setMsgs} loadingMore={loadingMore} bottomRef={bottomRef}/>
          </div>

          <Chat typeOfChat="global"/>
      </div>
        
        {/*private messaging section*/}
        <div className={`${(inboxHidden || !notificationHidden) &&`hidden`} h-full flex-1 bg-slate-600
          rounded-md flex flex-col text-slate-50`}>
          <PrivateChat setLastDocPrivate={setLastDocPrivate} msgs={privateMsgs} setMsgs={setPrivateMsgs} 
            loadingMorePrivate={loadingMorePrivate} bottomRef={bottomRefPrivate} 
            privateChatContainerRef={privateChatContainerRef} handleScrollPrivate={handleScrollPrivate}/>  
        </div>

      </div>
     
      {/*friends modal*/}
      <FriendsModal isInboxModalOpen={isInboxModalOpen} setIsInboxModalOpen={setIsInboxModalOpen} 
        handleMessage={handleMessage} handleAcceptRequest={handleAcceptRequest} handleDeleteRequest={handleDeleteRequest}
        operationLoading={operationLoading}/> 

    </div>
  }
  if(loading){
    return <div>Loading...</div>
  }
  return <div>

  you need to <Link to={'/login'} className="text-blue-500">login</Link> first.</div>
}


export default Homepage
