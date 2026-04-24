import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './components/Home';
import Auth from './components/Auth';
import { routes } from './utils/routes';

function App() {
  return (
      <Router>
        <div className='App'>
          <Routes>
            {routes.map((item)=>(
              <Route key={item.component} path={item.path} Component={item.component}/>
            ))
            }
          </Routes>
        </div>
      </Router>
  );
}

export default App;
