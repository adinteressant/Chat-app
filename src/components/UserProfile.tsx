import { DocumentData, setDoc } from 'firebase/firestore'
import { MessageCircle,UserPlus,Users,Loader2} from 'lucide-react'
import RequestReceived from './RequestReceived'
import RequestSent from './RequestSent'
import { useState } from 'react'
import { useAuthContext } from '../context/authContext'
import { db } from '../firebase'
import { addDoc,collection,or,and } from 'firebase/firestore'
import { FriendReqStatus } from '../collections/enums'
import {query,where,getDocs,deleteDoc,doc,updateDoc} from 'firebase/firestore'
import { checkAddRequest, checkConfirmRequest, checkRemoveRequest } from '../utils/checkOperation'
import { useInboxHidden, usePrivateChatAccount } from '../zustand/usePrivateChat'
interface UserProfileProps {
  message: DocumentData;
  notificationHidden:boolean;
  friendReqStatus: FriendReqStatus;
}
const UserProfile = ({message,notificationHidden,friendReqStatus}:UserProfileProps) => {
  const [messageDisabled,setMessageDisabled] = useState<boolean>(friendReqStatus!==FriendReqStatus.Friend)
  const [requestDisabled,setRequestDisabled] = useState<boolean>(false)
  const [friendStatus,setFriendStatus] = useState<FriendReqStatus>(friendReqStatus)
  const [loading,setLoading] = useState<boolean>(false)
// @ts-expect-error
  const {user} = useAuthContext()
// @ts-expect-error
  const {setPrivateChatAccount} = usePrivateChatAccount()
// @ts-expect-error
  const {setInboxHidden} = useInboxHidden()
  
  const handleFriendReq = async ():Promise<void> => {
  const q = query(
  collection(db, 'chat', 'global', 'friends'),
    or(
      and(
        where('sender', '==', user.email),
        where('receiver', '==', message.sender),
        where('status', 'in', ['pending', 'accepted'])
      ),
    and(
        where('sender', '==', message.sender),
        where('receiver', '==', user.email),
        where('status', 'in', ['pending', 'accepted'])
      )
    ),
  )

    const snapshot = await getDocs(q)
    setLoading(true) 
    setRequestDisabled(true)
    const [first,second] = [user.email,message.sender].sort()
    const fId = first+'_'+second
    switch(friendStatus){
      case FriendReqStatus.NotFriend:
        const reqExists = await checkAddRequest(user,message)
        if(reqExists){
          setFriendStatus(FriendReqStatus.RequestSent)
          setLoading(false)
          setRequestDisabled(false)
          break
        }
        try{
          await addDoc(collection(db,'chat','global','friends'),{
            sender:user.email,
            receiver:message.sender,
            status:'pending'
          })

          await setDoc(doc(db,'chat','global','friends2',fId),{ 
            sender:user.email,
            receiver:message.sender,
            status:'pending'
          })
        }catch(err){
          console.error(err)
        }finally{
          setFriendStatus(FriendReqStatus.RequestSent)
          setLoading(false)
          setRequestDisabled(false)
        }
        break
      case FriendReqStatus.RequestReceived:
        const reqAccepted = await checkConfirmRequest(user,message)
        if(reqAccepted){
            setFriendStatus(FriendReqStatus.Friend)
            setLoading(false)
            setRequestDisabled(false)
            setMessageDisabled(false)
            break
        }
        snapshot.docs.forEach(async (document) => {
          try{
            await updateDoc(doc(db, 'chat', 'global', 'friends', document.id), {
              status: 'accepted'
            })
            await updateDoc(doc(db,'chat','global','friends2',fId),{
              status:'accepted'
            })
          }catch(err){
            console.error(err)
          }finally{
            setFriendStatus(FriendReqStatus.Friend)
            setLoading(false)
            setRequestDisabled(false)
            setMessageDisabled(false)
          }
        })
        break
      default:
        const reqDoesnotExist = await checkRemoveRequest(user,message)
        if (reqDoesnotExist){
            setFriendStatus(FriendReqStatus.NotFriend)
            setLoading(false)
            setRequestDisabled(false)
            setMessageDisabled(true)
            break
        }
        snapshot.docs.forEach(async (document) => {
          try{
            await deleteDoc(doc(db, 'chat', 'global', 'friends', document.id))
            await deleteDoc(doc(db,'chat','global','friends2',fId))
          }catch(err){
            console.error(err)
          }finally{
            setFriendStatus(FriendReqStatus.NotFriend)
            setLoading(false)
            setRequestDisabled(false)
            setMessageDisabled(true)
          }
        })
    }
  }
  const handleMessage = () => {
    setPrivateChatAccount({
      name:message.senderName,
      email:message.sender,
      photoURL:message.imageURL
    })
    setInboxHidden(false) 
  }
  return <div className=" flex flex-col w-full h-full">
    <div className="border-b border-gray-200 flex-2 flex justify-center items-center">
      <div className="w-full flex flex-col items-center">
          <img className="w-12 h-12 rounded-full" src={message.imageURL} alt="photo"/>
          <div className="text-cyan-600">{message.senderName}</div>
      </div>
    </div>
    <div className="flex-1 flex text-cyan-600">
      <button className={`flex-1 flex justify-center items-center
      ${!requestDisabled && notificationHidden && `cursor-pointer hover:bg-cyan-600 hover:text-white`}
      ${(requestDisabled || !notificationHidden) && `bg-gray-300 text-white`}`}
      onClick={handleFriendReq} disabled={requestDisabled || !notificationHidden}
      >
        {loading ? <Loader2 className="animate-spin text-cyan-600 w-8 h-8"/> :
        (friendStatus === FriendReqStatus.NotFriend ? <UserPlus/> 
        : friendStatus === FriendReqStatus.RequestSent ? <RequestSent/>
        : friendStatus === FriendReqStatus.Friend ? <Users/>
        : <RequestReceived/>)
        }
      </button> 
      <button disabled={messageDisabled || !notificationHidden} className={`flex-1 flex justify-center
                items-center ${!messageDisabled && notificationHidden && `cursor-pointer hover:bg-cyan-600 hover:text-white`}
              ${(messageDisabled || !notificationHidden) && `bg-gray-300 text-white`}`}
              onClick={handleMessage}      
      >
        <MessageCircle/>
      </button>
    </div> 
  </div>
}
export default UserProfile
