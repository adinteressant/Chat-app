import { MessageCircle } from 'lucide-react'
import React from 'react'
import { collection, query, where,or,and,getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuthContext } from '../context/authContext'
import { useFriends } from '../zustand/useGetFriends'
import { sortArray } from '../utils/sortArray'
interface InboxLoaderProps {
  setIsInboxModalOpen: React.Dispatch<React.SetStateAction<boolean>>
}
const InboxLoader = ({setIsInboxModalOpen}:InboxLoaderProps) => {
// @ts-expect-error
  const {user} = useAuthContext()
// @ts-expect-error
  const {setFriends} = useFriends()
  const handleInboxLoader = async ():Promise<void> => {
    setIsInboxModalOpen(true) 
    let q = query(collection(db,'chat','global','friends2'),
    or(
        and(
          where('sender', '==', user.email),
          where('status','==','accepted')
        ),
      and(
          where('receiver', '==', user.email),
          where('status','in',['accepted','pending'])
        )
      )
    )
    let snapshot = await getDocs(q)
    const friendsInfo = snapshot.docs.map(doc =>doc.data().sender != user.email ? 
      {friend: doc.data().sender,latestMessageAt:doc.data().latestMessageAt,status:doc.data().status}
      :{friend:doc.data().receiver,latestMessageAt:doc.data().latestMessageAt,status:doc.data().status})
    
    q = query(collection(db,'users'))
    snapshot = await getDocs(q)
    const allUsers = snapshot.docs.map(doc => ({...doc.data()}))

    const friends = friendsInfo.map(info => {
       return {
        latestMessageAt:info.latestMessageAt,
        status:info.status,
        ...allUsers.find(user => user.email == info.friend)
      }
    })
    sortArray(friends)
    setFriends(friends)

  }
  return <div className="w-12 h-12 bg-slate-500 rounded-full flex items-center justify-center cursor-pointer
    hover:bg-slate-600 active:bg-slate-400"
  onClick={handleInboxLoader}>
    <MessageCircle className="text-slate-50"/> 
  </div>
}
export default InboxLoader
