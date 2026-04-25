import { useState, useEffect } from 'react';
import { getCurrentUser } from '../http/userAPI';

export function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = getCurrentUser();
        setUser(currentUser);
        setLoading(false);
    }, []);

    return { user, loading };
}