import { useState, useEffect } from 'react';
import { mockStorage, STORAGE_KEYS } from '@/lib/mockStorage';
import type { PI, Sponsor } from '@/hooks/useProposalData';

export function useMockPIs() {
  const [pis, setPis] = useState<PI[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPIs = async () => {
    setLoading(true);
    try {
      const data = mockStorage.getAll<PI>(STORAGE_KEYS.PIS);
      const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
      setPis(sorted);
    } catch (error) {
      console.error('Error fetching PIs:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPI = async (name: string): Promise<PI | null> => {
    try {
      const newPI = mockStorage.insert<PI>(STORAGE_KEYS.PIS, { name } as PI);
      setPis(prev => [...prev, newPI].sort((a, b) => a.name.localeCompare(b.name)));
      return newPI;
    } catch (error) {
      console.error('Error creating PI:', error);
      return null;
    }
  };

  const updatePI = async (id: string, name: string): Promise<PI | null> => {
    try {
      const updated = mockStorage.update<PI>(STORAGE_KEYS.PIS, id, { name } as Partial<PI>);
      if (updated) {
        await fetchPIs();
      }
      return updated;
    } catch (error) {
      console.error('Error updating PI:', error);
      return null;
    }
  };

  const deletePI = async (id: string): Promise<boolean> => {
    try {
      // Check if PI is used in any files
      const files = mockStorage.getAll(STORAGE_KEYS.FILES);
      const isUsed = files.some((f: any) => f.pi_id === id);

      if (isUsed) {
        console.error('Cannot delete PI: still referenced in proposals');
        return false;
      }

      const success = mockStorage.delete(STORAGE_KEYS.PIS, id);
      if (success) {
        await fetchPIs();
      }
      return success;
    } catch (error) {
      console.error('Error deleting PI:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchPIs();
  }, []);

  return { pis, loading, createPI, updatePI, deletePI, refetch: fetchPIs };
}

export function useMockSponsors() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSponsors = async () => {
    setLoading(true);
    try {
      const data = mockStorage.getAll<Sponsor>(STORAGE_KEYS.SPONSORS);
      const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
      setSponsors(sorted);
    } catch (error) {
      console.error('Error fetching sponsors:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSponsor = async (name: string): Promise<Sponsor | null> => {
    try {
      const newSponsor = mockStorage.insert<Sponsor>(STORAGE_KEYS.SPONSORS, { name } as Sponsor);
      setSponsors(prev => [...prev, newSponsor].sort((a, b) => a.name.localeCompare(b.name)));
      return newSponsor;
    } catch (error) {
      console.error('Error creating sponsor:', error);
      return null;
    }
  };

  const updateSponsor = async (id: string, name: string): Promise<Sponsor | null> => {
    try {
      const updated = mockStorage.update<Sponsor>(STORAGE_KEYS.SPONSORS, id, { name } as Partial<Sponsor>);
      if (updated) {
        await fetchSponsors();
      }
      return updated;
    } catch (error) {
      console.error('Error updating sponsor:', error);
      return null;
    }
  };

  const deleteSponsor = async (id: string): Promise<boolean> => {
    try {
      // Check if sponsor is used in any files
      const files = mockStorage.getAll(STORAGE_KEYS.FILES);
      const isUsed = files.some((f: any) => f.sponsor_id === id);

      if (isUsed) {
        console.error('Cannot delete sponsor: still referenced in proposals');
        return false;
      }

      const success = mockStorage.delete(STORAGE_KEYS.SPONSORS, id);
      if (success) {
        await fetchSponsors();
      }
      return success;
    } catch (error) {
      console.error('Error deleting sponsor:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchSponsors();
  }, []);

  return { sponsors, loading, createSponsor, updateSponsor, deleteSponsor, refetch: fetchSponsors };
}
