/**
 * PocketBase Proposal Data Hook
 * Manages PIs and Sponsors data from PocketBase
 */

import { useState, useEffect } from 'react';
import { pb } from '@/integrations/pocketbase/client';

export interface PI {
  id: string;
  name: string;
}

export interface Sponsor {
  id: string;
  name: string;
}

export function usePocketBasePIs() {
  const [pis, setPis] = useState<PI[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPIs = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('pis').getFullList({
        sort: 'name',
      });

      const formattedPIs: PI[] = records.map((record: any) => ({
        id: record.id,
        name: record.name,
      }));

      setPis(formattedPIs);
    } catch (error) {
      console.error('Error fetching PIs from PocketBase:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPI = async (name: string): Promise<PI | null> => {
    try {
      const record = await pb.collection('pis').create({
        name,
      });

      const newPI: PI = {
        id: record.id,
        name: record.name,
      };

      setPis(prev => [...prev, newPI]);
      return newPI;
    } catch (error) {
      console.error('Error creating PI in PocketBase:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchPIs();
  }, []);

  return { pis, loading, createPI, refetch: fetchPIs };
}

export function usePocketBaseSponsors() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSponsors = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('sponsors').getFullList({
        sort: 'name',
      });

      const formattedSponsors: Sponsor[] = records.map((record: any) => ({
        id: record.id,
        name: record.name,
      }));

      setSponsors(formattedSponsors);
    } catch (error) {
      console.error('Error fetching sponsors from PocketBase:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSponsor = async (name: string): Promise<Sponsor | null> => {
    try {
      const record = await pb.collection('sponsors').create({
        name,
      });

      const newSponsor: Sponsor = {
        id: record.id,
        name: record.name,
      };

      setSponsors(prev => [...prev, newSponsor]);
      return newSponsor;
    } catch (error) {
      console.error('Error creating sponsor in PocketBase:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchSponsors();
  }, []);

  return { sponsors, loading, createSponsor, refetch: fetchSponsors };
}
