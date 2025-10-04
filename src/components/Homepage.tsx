import { signOut } from 'firebase/auth'
import { useAuthContext } from '../context/authContext'
import { Link, useLocation } from 'react-router-dom'
import { auth, db } from '../firebase'
import Chat from './chat'
import Messages from './messages'
import PrivateChat from './PrivateChat'
import { useEffect, useRef, useState } from 'react'
import { Check,Trash,Loader2 } from 'lucide-react'
import { useInboxHidden, usePrivateChatAccount } from '../zustand/usePrivateChat'
import InboxLoader from './InboxLoader'
import Modal from './Modal'
import { useFriends } from '../zustand/useGetFriends'
import { Friend, User } from '../collections/types'
import { handleFriendReq } from '../utils/handleFriendReq'
import { QueryDocumentSnapshot,DocumentData, collection, query, orderBy, startAfter, limit, getDocs, getDoc } from 'firebase/firestore'
import { MORE_MESSAGE_LENGTH } from '../collections/constants'
const Homepage = () => {
  const {user,setUser,loading} = useAuthContext()
  const location = useLocation()
  const [notificationHidden,setNotificationHidden] = useState<boolean>(true)
  const [isInboxModalOpen,setIsInboxModalOpen] = useState<boolean>(false)
  const [operationLoading,setOperationLoading] = useState<boolean>(false)
  const {inboxHidden,setInboxHidden} = useInboxHidden()
  const {friends} = useFriends()
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
  const {privateChatAccount} = usePrivateChatAccount()


  const handleLogout = async ():Promise<void> =>{
    try{
      await signOut(auth)
      setUser({
        displayName:'',
        email:''
      })
      window.location.href='/login' 
    }catch(err){
      console.error(err)
    }
  }
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
  
    return <div className="p-2">
    <div className="flex gap-2 items-center">
      <div>
        <img src={user.photoURL} alt="photo" className="rounded-full w-10 h-10"/>
      </div>
      <div>{user.displayName}</div>
    
      <InboxLoader setIsInboxModalOpen={setIsInboxModalOpen}/>
      <div>
        <button className="p-1.5 hover:bg-cyan-700
        text-slate-50 bg-cyan-600 rounded-md cursor-pointer" onClick={handleLogout}>Logout</button>
      </div>
      </div>
      <div className="w-xl">
        <div className="m-2 bg-slate-600 p-0 w-xl fixed overflow-y-auto top-16 bottom-2 rounded-md"
        ref={chatContainerRef} onScroll={handleScroll}>
          <div className="flex flex-col h-full relative">
            <div className={`${notificationHidden && `hidden`} flex-1 sticky p-1 z-50 w-full bg-amber-400 top-0 left-0 text-amber-800`}>
              Content has been updated.
              <span className="underline text-cyan-800 cursor-pointer" 
                onClick={refreshPage}>Refresh</span> to view latest content.
            </div>
            <div className="flex-15">
              <Messages  setNotificationHidden={setNotificationHidden} notificationHidden={notificationHidden}
              setLastDoc={setLastDoc} Msgs={Msgs} setMsgs={setMsgs} loadingMore={loadingMore} bottomRef={bottomRef}/>
            </div>  
            <Chat typeOfChat="global"/>
          </div>
        </div>
        <div className={`${(inboxHidden || !notificationHidden) &&`hidden`} m-2 fixed left-[40rem] bg-slate-600 p-0 w-xl overflow-y-auto top-16
          bottom-2 rounded-md`} ref={privateChatContainerRef} onScroll={handleScrollPrivate}>
          <PrivateChat
          setLastDocPrivate={setLastDocPrivate} msgs={privateMsgs} setMsgs={setPrivateMsgs} 
            loadingMorePrivate={loadingMorePrivate} bottomRef={bottomRefPrivate}/>  
        </div>
      </div>
      <Modal
        isOpen={isInboxModalOpen}
        onClose={() => setIsInboxModalOpen(false)}
        title="Inbox"
      >
        <div className="flex flex-col gap-2 text-slate-50">
          {
            friends.map((friend:Friend) => (
              <div key={friend.email} className="items-center pr-2 justify-between flex border-b border-gray-500 p-1">
                <div className="flex gap-2 items-center">
                  <img src={friend.photoURL} alt="photo" className="w-10 h-10 rounded-full"/>
                  <div>{friend.displayName}</div>
                </div>
                <div>
                { friend.status=='accepted' ?
                  <button className="bg-cyan-600 p-1 rounded-md hover:bg-cyan-700 cursor-pointer"
                  onClick={()=>{handleMessage(friend)}}>
                    Message
                  </button>
                : <div className="flex gap-2">
                    <button className="w-8 h-8 flex justify-center items-center p-1 rounded-sm bg-cyan-600 hover:bg-cyan-700
                        cursor-pointer"
                      onClick={()=>{handleAcceptRequest(friend.email)}}
                      disabled={operationLoading}>
                        {operationLoading?
                          <Loader2 className="animate-spin w-5 h-5"/>
                          :
                          <Check className="w-5 h-5"/>
                        }
                    </button>
                    <button className="w-8 h-8 flex justify-center items-center p-1 rounded-sm bg-red-600/50 
                        hover:bg-red-600/60 cursor-pointer"
                      onClick={()=>{handleDeleteRequest(friend.email)}}
                      disabled={operationLoading}>
                        {operationLoading?
                          <Loader2 className="animate-spin w-5 h-5"/>
                          :
                          <Trash className="w-5 h-5"/>
                        }
                    </button>
                  </div>
                  }
                </div>
              </div>
            ))
          }
        </div>
      </Modal>
    </div>
  }
  if(loading){
    return <div>Loading...</div>
  }
  return <div>

  you need to <Link to={'/login'} className="text-blue-500">login</Link> first.</div>
}


export default Homepage
