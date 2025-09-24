import { collection, getDocs, query, where } from 'firebase/firestore'
import { useEffect } from 'react'
import { db } from '../firebase'

enum FriendStatus {
  NotFriend,
  RequestSent,
  Friend
}
export const useGetFriends = (user:string) => {
  useEffect(()=>{
    const getFriendStatus = async():Promise<void> => {
      console.log('hii')
      try{
        let messageQuery = query(collection(db,'chat','global','friends'),
        where('sender','==',user));
        const snapshot1 = await getDocs(messageQuery)
        const senderMessages = snapshot1.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        console.log(senderMessages)
      }catch(err){
        console.error(err)
      }
      await getFriendStatus()
    }
  },[])
}
