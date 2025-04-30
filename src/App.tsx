import { Outlet } from 'react-router-dom'
import { AuthContextProvider } from './context/authContext'
function App() {

  return <div> 
    <AuthContextProvider>
    <Outlet/>
    </AuthContextProvider>
  </div>
}

export default App
