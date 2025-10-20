/**
 * PocketBase Dashboard Hook
 * Provides dashboard statistics and metrics
 */

import { useState, useEffect } from 'react';
import { pb } from '@/integrations/pocketbase/client';

export interface DashboardStats {
  totalProposals: number;
  statusBreakdown: Record<string, number>;
  totalPIs: number;
  totalSponsors: number;
  recentProposals: any[];
}

export function usePocketBaseDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      // Fetch files for dashboard metrics
      const files = await pb.collection('files').getFullList();

      // Fetch counts for other collections
      const pisCount = await pb.collection('pis').getFullList();
      const sponsorsCount = await pb.collection('sponsors').getFullList();

      // Calculate status breakdown
      const statusBreakdown: Record<string, number> = {};
      files.forEach((file: any) => {
        statusBreakdown[file.status] = (statusBreakdown[file.status] || 0) + 1;
      });

      // Get recent proposals (last 5)
      const recentProposals = await pb.collection('files').getFullList({
        sort: '-date_received',
        limit: 5,
        expand: 'pi_id,sponsor_id',
      });

      setStats({
        totalProposals: files.length,
        statusBreakdown,
        totalPIs: pisCount.length,
        totalSponsors: sponsorsCount.length,
        recentProposals: recentProposals.map((p: any) => ({
          id: p.id,
          db_no: p.db_no,
          pi_name: p.expand?.pi_id?.name || '',
          sponsor_name: p.expand?.sponsor_id?.name || '',
          status: p.status,
          date_received: p.date_received,
        })),
      });
    } catch (error) {
      console.error('Error fetching dashboard stats from PocketBase:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return { stats, loading, refetch: fetchDashboardStats };
}
