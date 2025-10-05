import React from 'react'
import Modal from './Modal'
import { Friend } from '../collections/types'
import { useFriends } from '../zustand/useGetFriends'
import { User } from '../collections/types'
import { Loader2,Check,Trash } from 'lucide-react'

interface FriendsModalProps {
  isInboxModalOpen:boolean
  setIsInboxModalOpen:React.Dispatch<React.SetStateAction<boolean>>
  handleMessage:(friend:User)=>void
  handleAcceptRequest:(reqSender:string)=>void
  operationLoading:boolean
  handleDeleteRequest:(reqSender:string)=>void
}

const FriendsModal = ({isInboxModalOpen,setIsInboxModalOpen,handleMessage,handleAcceptRequest,
                      operationLoading,handleDeleteRequest}:FriendsModalProps) => {
  // @ts-expect-error
  const {friends} = useFriends()
  return <Modal
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

}

export default FriendsModal
