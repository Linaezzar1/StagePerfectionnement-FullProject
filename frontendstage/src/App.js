
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import LoginSignup from "./components/loginSignup/LoginSignup";
import Dash from './components/dashboard/Dash/Dash';
import Files from './components/dashboard/Files/Files';
import Analytics from './components/dashboard/Analytics/Analytics';
import Customers from './components/dashboard/Customers/Customers';
import DashboardLayout from './components/dashboard/Dashboardlayout';
import Profile from './components/Profile/Profile';
import MainAnalytics from './components/mainAnalytics/MainAnalytics';
import ProtectedRoute from './components/CodeEditor/ProtectedRoute';
import MainEditor from './components/CodeEditor/MainEditor';
import UserFilesProfile from './components/UserFilesProfile/UserFilesProfile';
import MainUserFiles from './components/UserFilesProfile/MainUserFiles';
import Message from './components/dashboard/Messages/Message';




function App() {
  
  return (

    <div className="App">
      <BrowserRouter>

        <Routes>
          {/* Route Login */}
          <Route path='/login' element={<LoginSignup />} />

          {/* Route Dashboard avec des routes imbriquées */}
          <Route path="/dashboard" element={<ProtectedRoute element={DashboardLayout} />}>
            {/* Route pour le tableau de bord principal */}
            <Route path='maindash' element={<Dash />} />
            {/* Route pour les fichiers */}
            <Route path='files' element={<Files />} />
            {/* Route pour les clients */}
            <Route path='customers' element={<Customers />} />
            {/*Route pour les messages*/}
            <Route path='messages' element={<Message />} />
            {/* Route pour les analyses */}
            <Route path='analytics' element={<Analytics />} />
            {/* Route par défaut pour /dashboard */}
            <Route index element={<Dash />} />
          </Route>

          <Route path='/profile' element={<Profile />} />

          <Route
            path='/editor'
            element={<ProtectedRoute element={MainEditor } />}
          />

          <Route path='/UserFilePage' element= {<ProtectedRoute element={MainUserFiles} />} />
          {/* Route par défaut (redirige vers /login) */}
          <Route path="/" element={<LoginSignup />} />

          <Route path='/mainAnalytics'  element={<ProtectedRoute element={MainAnalytics} />} />
        </Routes>
      </BrowserRouter>
      
    </div >


  );
}

export default App;
