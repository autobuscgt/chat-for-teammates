import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './components/Home';
import Auth from './components/Auth';


function App() {
  return (
      <Router>
        <div className='App'>
          <Routes>
            <Route
              path='/chat'
              element={<Home/>}
            />

            <Route 
            path='/register' 
            element={<Auth/>}
            />
            
            <Route 
            path='/login' 
            element={<Auth/>}
            />

          </Routes>
        </div>
      </Router>
  );
}

export default App;
