/**
 * PocketBase Dashboard Hook
 * Provides dashboard statistics and metrics
 */

import { useState, useEffect } from 'react';
import { pb } from '@/integrations/pocketbase/client';

const POCKETBASE_URL = import.meta.env.VITE_POCKETBASE_URL || 'http://localhost:8090';

export interface DashboardStats {
  totalFiles: number;
  statusCounts: Record<string, number>;
}

export function usePocketBaseDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      // Fetch files using REST API with pagination to handle large result sets
      let allFiles: any[] = [];
      let page = 1;
      let hasMore = true;
      const pageSize = 500;

      while (hasMore) {
        const response = await fetch(
          `${POCKETBASE_URL}/api/collections/files/records?page=${page}&perPage=${pageSize}`,
          {
            headers: {
              'Authorization': `Bearer ${pb.authStore.token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch files: ${response.status}`);
        }

        const data = await response.json();
        allFiles = allFiles.concat(data.items || []);
        hasMore = page < data.totalPages;
        page++;
      }

      // Calculate status counts
      const statusCounts: Record<string, number> = {};
      allFiles.forEach((file: any) => {
        statusCounts[file.status] = (statusCounts[file.status] || 0) + 1;
      });

      console.log(`✅ Dashboard loaded: ${allFiles.length} total files, ${JSON.stringify(statusCounts)}`);

      setStats({
        totalFiles: allFiles.length,
        statusCounts,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats from PocketBase:', error);
      setStats({
        totalFiles: 0,
        statusCounts: {},
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return { stats, loading, refetch: fetchDashboardStats };
}
