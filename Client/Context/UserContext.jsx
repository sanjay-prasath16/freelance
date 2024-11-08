import axios from 'axios';
import { createContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import PropTypes from 'prop-types';

export const UserContext = createContext();

export function UserContextProvider({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorHandled, setErrorHandled] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/userDetails');

                if (response.data && response.data.user) {
                    setUser(response.data.user);

                    if (location.pathname === '/' || location.pathname === '/register') {
                        navigate('/home');
                    }
                }
            } catch (err) {
                if (!errorHandled) {
                    toast.error(err);
                    setErrorHandled(true);
                    navigate('/');
                }
            } finally {
                setLoading(false);
            }
        };

        if (!user && !errorHandled) {
            fetchData();
        }
    }, [navigate, location.pathname, user, errorHandled]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
}

UserContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
};