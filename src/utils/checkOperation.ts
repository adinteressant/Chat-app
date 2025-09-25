import { query,collection,and,or,where,getDocs, DocumentData } from 'firebase/firestore'
import { db } from '../firebase'
import { User } from '../collections/types'

export const checkAddRequest = async (user:User,message:DocumentData):Promise<boolean> => {

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
  if (snapshot.docs.length>0) {
    return true
  }
  return false
}

export const checkRemoveRequest = async (user:User,message:DocumentData):Promise<boolean> => {
  const reqExists = await checkAddRequest(user,message)
  return !reqExists
}

export const checkConfirmRequest = async (user:User,message:DocumentData):Promise<boolean> => {
  const q = query(
    collection(db, 'chat', 'global', 'friends'),
      or(
        and(
          where('sender', '==', user.email),
          where('receiver', '==', message.sender),
          where('status', '==', 'accepted')
        ),
      and(
          where('sender', '==', message.sender),
          where('receiver', '==', user.email),
          where('status', '==', 'accepted')
        )
      ),
    )
  const snapshot = await getDocs(q)
  if (snapshot.docs.length>0) {
    return true
  }
  return false
}
