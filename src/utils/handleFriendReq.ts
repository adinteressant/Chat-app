import { query,collection,deleteDoc,where,getDocs,updateDoc,doc } from 'firebase/firestore'
import { db } from '../firebase'

export const handleFriendReq = async (
  operation:string,
  reqSender:string,
  user:string,
  setLoading:React.Dispatch<React.SetStateAction<boolean>>,
  refreshPage:()=>void
):Promise<void> => {

  const q = query(
  collection(db, 'chat', 'global', 'friends'),
  where('sender','==',reqSender),
  where('status','==','pending')
  )

    const snapshot = await getDocs(q)
    const [first,second] = [user,reqSender].sort()
    const fId = first+'_'+second
    setLoading(true)
    switch(operation){
      case 'accept':
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
            setLoading(false)
            refreshPage()
          }
        })
        break
      default:
        snapshot.docs.forEach(async (document) => {
          try{
            await deleteDoc(doc(db, 'chat', 'global', 'friends', document.id))
            await deleteDoc(doc(db,'chat','global','friends2',fId))
          }catch(err){
            console.error(err)
          }finally{
            setLoading(false)
            refreshPage() 
          }
        })
    }
  
  }
