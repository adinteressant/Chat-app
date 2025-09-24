import { DocumentData } from 'firebase/firestore'
import { MessageCircle,UserPlus,Users} from 'lucide-react'
import RequestReceived from './RequestReceived'
import RequestSent from './RequestSent'
import { useState } from 'react'
import { useAuthContext } from '../context/authContext'
import { db } from '../firebase'
import { addDoc,collection } from 'firebase/firestore'
import { FriendReqStatus } from '../collections/enums'
interface UserProfileProps {
  message: DocumentData;
  friendReqStatus: FriendReqStatus;
}
const UserProfile = ({message,friendReqStatus}:UserProfileProps) => {
  const [messageDisabled,setMessageDisabled] = useState<boolean>(true)
  const [friendStatus,setFriendStatus] = useState<FriendReqStatus>(friendReqStatus)
  const {user} = useAuthContext()
   const handleFriendReq = async ():Promise<void> => {
    await addDoc(collection(db,'chat','global','friends'),{
      sender:user.email,
      receiver:message.sender,
      status:'pending'
    })
  }
  return <div className=" flex flex-col w-full h-full">
    <div className="border-b border-gray-200 flex-2 flex justify-center items-center">
      <div className="w-full flex flex-col items-center">
          <img className="w-12 h-12 rounded-full" src={message.imageURL} alt="photo"/>
          <div className="text-cyan-600">{message.senderName}</div>
      </div>
    </div>
    <div className="flex-1 flex text-cyan-600">
      <button className="flex-1 cursor-pointer flex justify-center items-center hover:bg-cyan-600 hover:text-white"
      onClick={handleFriendReq}
      >
        {
          friendStatus === FriendReqStatus.NotFriend ? <UserPlus/> 
        : friendStatus === FriendReqStatus.RequestSent ? <RequestSent/>
        : friendStatus === FriendReqStatus.Friend ? <Users/>
        : <RequestReceived/>
        }
      </button> 
      <button disabled={messageDisabled} className={`flex-1 flex justify-center
                items-center ${!messageDisabled && `cursor-pointer hover:bg-cyan-600 hover:text-white`} ${messageDisabled && `bg-gray-300 text-white`}`}
            >
        <MessageCircle/>
      </button>
    </div> 
  </div>
}
export default UserProfile
