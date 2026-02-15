import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function RequireProfile() {
    const { profile } = useAuth();

    if (!profile) {
        return <Navigate to="/onboarding" replace />;
    }

    return <Outlet />;
}
