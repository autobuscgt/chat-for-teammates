import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { routes } from './utils/routes';
import { NavigationProvider } from './context/NavigationContext';
import { HOME_ROUTE } from './utils/consts';

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
            <Route path='*' element={<Navigate to={"/contacts"}/>}/>
          </Routes>
        </div>
        </NavigationProvider>
      </Router>
  );
}

export default App;
