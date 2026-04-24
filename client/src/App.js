import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
