import { Bell,User } from 'lucide-react'

const RequestReceived = () => {
  return <div className='relative'>
    <User className=""/>
    <Bell className="absolute w-2 h-2 top-1.5 right-0" strokeWidth={4}/>
  </div>
}

export default RequestReceived
