import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../Context/UserContext';
import PropTypes from 'prop-types';

function PrivateRoute({ children }) {
    const { user } = useContext(UserContext);

    if (!user) {
        return <Navigate to="/" />;
    }

    return children;
}

export default PrivateRoute;

PrivateRoute.propTypes = {
    children: PropTypes.node.isRequired,
}