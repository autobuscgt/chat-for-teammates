import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { routes } from './utils/routes';
import { NavigationProvider } from './context/NavigationContext';
import { HOME_ROUTE } from './utils/consts';
import { useAuth } from './hooks/useAuth';



function App() {
  const {user} = useAuth();
  const isLogin = user;
  return (
      <Router>
        <NavigationProvider>
        <div className='App'>
          <Routes>
            {routes.map((item)=>(
              <Route key={item.component} path={item.path} Component={item.component}/>
            ))
            }
            {isLogin ? (
            <Route path= '*' element={<Navigate to={"/contacts"}/>}/> 
            ): (
            <Route path= '*' element={<Navigate to={"/register"}/>}/>
            )
            }
            
          </Routes>
        </div>
        </NavigationProvider>
      </Router>
  );
}

export default App;
