export type User = {
  displayName:string,
  email:string,
  photoURL:string
}
export type UserContext = {
  user:User,
  setUser:React.Dispatch<React.SetStateAction<User>>,
  loading:boolean
}
export type FriendStatus = {
  id:string,
  receiver:string,
  sender:string,
  status:string
}


