import {Routes,Route} from 'react-router-dom'
import { Landing } from './pages/Landing'
import {Dashboard} from './pages/Dashboard'

function App(){
    return(
        <div>
          <Routes>
             <Route path="/" element={<Landing/>} />
            <Route path="/dashboard" element={<Dashboard/>}/>
          </Routes>
        </div>
    )
}

export default App;