import { Clock,User } from 'lucide-react'

const RequestSent = () => {
  return <div className='relative'>
    <User className=""/>
    <Clock className="absolute w-2 h-2 top-1.5 right-0" strokeWidth={4}/>
  </div>
}

export default RequestSent
