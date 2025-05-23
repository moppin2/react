import { useState, useEffect } from 'react';
import api from '../services/api';

export function useProfile(type, id) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        async function fetch() {
            try {
                const { data: profile } = await api.get(`/api/profile/${type}/${id}`);
                if (!cancelled) setData(profile);

            } catch (err) {
                console.error(err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        fetch();
        return () => { cancelled = true; };
    }, [type, id]);

    return { data, loading };
}