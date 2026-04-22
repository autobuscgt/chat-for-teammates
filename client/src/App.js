import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './components/Home';


function App() {
  return (
      <Router>
        <div className='App'>
          <Routes>
            <Route
              path='/chat'
              element={<Home/>}
            />
          </Routes>
        </div>
      </Router>
  );
}

export default App;
