'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminService } from '../services/admin.service';
import { AdminPage, AdminRecord, AdminSection } from '../types/admin.types';

export function useAdminSection(section: AdminSection) {
  const [data, setData] = useState<AdminPage>({ items: [], total: 0, page: 1, limit: 20 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const refresh = useCallback(async (page = data.page, term = search, statusFilter = status) => {
    setLoading(true);
    setError('');
    try { setData(await adminService.getSection(section, page, term, statusFilter || undefined)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not load this section.'); }
    finally { setLoading(false); }
  }, [data.page, search, section, status]);
  useEffect(() => { void refresh(1, ''); }, [section]);
  const update = (next: Partial<AdminPage>) => setData((current) => ({ ...current, ...next }));
  return { ...data, search, setSearch, status, setStatus, loading, error, refresh, update };
}

export function getRecordValue(record: AdminRecord, path: string): unknown {
  return path.split('.').reduce<unknown>((value, key) => value && typeof value === 'object' ? (value as AdminRecord)[key] : undefined, record);
}
