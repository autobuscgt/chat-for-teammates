import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { routes } from './utils/routes';
import { NavigationProvider } from './context/NavigationContext';

function App() {
  return (
      <Router>
        <NavigationProvider>
        <div className='App'>
          <Routes>
            {routes.map((item)=>(
              <Route key={item.component} path={item.path} Component={item.component}/>
            ))
            }
          </Routes>
        </div>
        </NavigationProvider>
      </Router>
  );
}

export default App;
