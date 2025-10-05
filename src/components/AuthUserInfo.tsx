import { Link } from 'react-router-dom'
import { useAuthContext } from '../context/authContext'
import InboxLoader from './InboxLoader'

interface AuthUserInfoProps {
  setIsInboxModalOpen:React.Dispatch<React.SetStateAction<boolean>>,
}

const AuthUserInfo = ({setIsInboxModalOpen}:AuthUserInfoProps) => {
// @ts-expect-error
  const {user} = useAuthContext()
  return <div className="flex gap-2 items-center">
        <div>
          <img src={user.photoURL} alt="photo" className="rounded-full w-10 h-10"/>
        </div>
        <div>{user.displayName}</div>
    
        <InboxLoader setIsInboxModalOpen={setIsInboxModalOpen}/>
        <div>
          <Link className="p-1.5 hover:bg-cyan-700
          text-slate-50 bg-cyan-600 rounded-md cursor-pointer" to={'/logout'}>Logout</Link>
        </div>
      </div>
}

export default AuthUserInfo
