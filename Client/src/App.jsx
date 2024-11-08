import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';
import Register from './Pages/Register';
import Login from './Pages/Login';
import Home from './Pages/Home';
import Members from './Pages/Members';
import Profile from './Pages/Profile';
import Saved from './Pages/Saved';
import Layout from './Components/Layout';
import PrivateRoute from '../PrivateRoute/PrivateRoute';
import { UserContextProvider } from '../Context/UserContext';
import './App.css';

axios.defaults.baseURL = import.meta.env.VITE_REACT_BACKEND_URL;
axios.defaults.withCredentials = true;

function App() {
    return (
        <Router>
            <UserContextProvider>
                <Toaster position='top-center' toastOptions={{ duration: 2000 }} />
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route element={<Layout />}>
                        <Route path="/home" element={
                            <PrivateRoute>
                                <Home />
                            </PrivateRoute>
                        } />
                        <Route path="/members" element={
                            <PrivateRoute>
                                <Members />
                            </PrivateRoute>
                        } />
                        <Route path="/profile" element={
                            <PrivateRoute>
                                <Profile />
                            </PrivateRoute>
                        } />
                        <Route path="/saved" element={
                            <PrivateRoute>
                                <Saved />
                            </PrivateRoute>
                        } />
                    </Route>
                </Routes>
            </UserContextProvider>
        </Router>
    );
}

export default App;