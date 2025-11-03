import { useState, useEffect } from 'react';
import { mockStorage, STORAGE_KEYS } from '@/lib/mockStorage';

export function useMockDashboard() {
  const [stats, setStats] = useState({
    totalFiles: 0,
    statusCounts: {} as Record<string, number>,
  });
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const files = mockStorage.getAll(STORAGE_KEYS.FILES);

      const statusCounts = files.reduce((acc: Record<string, number>, file: any) => {
        acc[file.status] = (acc[file.status] || 0) + 1;
        return acc;
      }, {});

      setStats({
        totalFiles: files.length,
        statusCounts,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, refetch: fetchStats };
}
