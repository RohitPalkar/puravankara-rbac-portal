import type { Action } from 'src/types';

const ACTION_NAMES = ['View', 'Create', 'Edit', 'Delete', 'Approve', 'Reject', 'Export', 'Upload', 'Sign', 'Revoke', 'Schedule', 'Send', 'RESET_PASSWORD'];

const ACTION_NAME_TO_CODE: Record<string, string> = {
  View: 'VIEW',
  Create: 'CREATE',
  Edit: 'EDIT',
  Delete: 'DELETE',
  Approve: 'APPROVE',
  Reject: 'REJECT',
  Export: 'EXPORT',
  Upload: 'UPLOAD',
  Sign: 'SIGN',
  Revoke: 'REVOKE',
  Schedule: 'SCHEDULE',
  Send: 'SEND',
};

interface ActionCacheEntry {
  id: number;
  name: string;
  code: string;
}

class ActionMapperService {
  private cache: ActionCacheEntry[] | null = null;

  private loading: Promise<void> | null = null;

  async initialize(actions: ActionCacheEntry[]): Promise<void> {
    this.cache = actions;
  }

  async loadFromApi(fetchFn: () => Promise<Action[]>): Promise<void> {
    if (this.cache) return undefined;
    if (this.loading) return this.loading;

    this.loading = (async () => {
      try {
        const actions = await fetchFn();
        this.cache = actions.map((a) => ({
          id: Number(a.id),
          name: a.name,
          code: a.code,
        }));
      } catch {
        this.cache = ACTION_NAMES.map((name, idx) => ({
          id: idx + 1,
          name,
          code: ACTION_NAME_TO_CODE[name] || name.toUpperCase(),
        }));
      }
    })();

    await this.loading;
    this.loading = null;
    return undefined;
  }

  getActionId(name: string): number | undefined {
    if (!this.cache) return undefined;
    const entry = this.cache.find(
      (a) => a.name === name || a.code === name || a.code === name.toUpperCase()
    );
    return entry?.id;
  }

  getActionName(id: number): string | undefined {
    return this.cache?.find((a) => a.id === id)?.name;
  }

  getActionNames(ids: number[]): string[] {
    if (!this.cache) return [];
    return ids
      .map((id) => this.getActionName(id))
      .filter((n): n is string => !!n);
  }

  getActionIds(names: string[]): number[] {
    return names
      .map((name) => this.getActionId(name))
      .filter((id): id is number => !!id);
  }

  getAllActions(): ActionCacheEntry[] {
    return this.cache || [];
  }

  isReady(): boolean {
    return this.cache !== null;
  }
}

export const actionMapper = new ActionMapperService();
