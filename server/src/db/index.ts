import { IStoreXRepository } from './interfaces.js';
import { MemoryAdapter } from './adapters/memory.adapter.js';
import { SupabaseAdapter } from './adapters/supabase.adapter.js';
import { MongoAdapter } from './adapters/mongo.adapter.js';
import { MySQLAdapter } from './adapters/mysql.adapter.js';

let repositoryInstance: IStoreXRepository | null = null;

export function getRepository(): IStoreXRepository {
  if (repositoryInstance) {
    return repositoryInstance;
  }

  const driver = (process.env.DB_DRIVER || 'memory').toLowerCase();

  switch (driver) {
    case 'supabase':
      console.log('[StoreX] Instantiating Supabase database driver...');
      repositoryInstance = new SupabaseAdapter();
      break;
    case 'mongodb':
    case 'mongo':
      console.log('[StoreX] Instantiating MongoDB database driver...');
      repositoryInstance = new MongoAdapter();
      break;
    case 'mysql':
      console.log('[StoreX] Instantiating MySQL database driver...');
      repositoryInstance = new MySQLAdapter();
      break;
    case 'memory':
    default:
      console.log('[StoreX] Instantiating In-Memory database driver...');
      repositoryInstance = new MemoryAdapter();
      break;
  }

  return repositoryInstance;
}

export async function initDatabase(): Promise<IStoreXRepository> {
  const repo = getRepository();
  await repo.initialize();
  return repo;
}

export * from './interfaces.js';
