export const SAMPLE_PROJECT_FILES: Record<string, string> = {
  'src/index.ts': `import { AuthService } from './services/AuthService';
import { Database } from './db/Database';

const db = new Database();
const auth = new AuthService(db);

console.log('Project Truth Engine IDE booted successfully.');
auth.login('admin@aiide.dev', 'secret123');
`,
  'src/qwythos/agent_truth.qw': `// Qwythos AI System Spec & Invariant Engine
truth ProjectTruthEngine {
  invariant: "FilesystemIsGroundTruth"
  hash_algorithm: "SHA-256"
  stale_detection: true
}

agent TruthValidatorAgent {
  intent verify_file_hash(path: String, hash: String) -> Bool {
    let current_hash = system.compute_sha256(path)
    return current_hash == hash
  }

  intent reconcile_project_index() -> Void {
    System.rebuild_ast_graph()
    System.log_event("Index reconciled cleanly via Qwythos engine")
  }
}
`,
  'src/services/AuthService.ts': `import { Database } from '../db/Database';

export interface UserSession {
  userId: string;
  token: string;
  expiresAt: number;
}

export class AuthService {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  public async login(email: string, pass: string): Promise<UserSession> {
    if (!email || !pass) {
      throw new Error('Invalid credentials');
    }
    
    return {
      userId: 'usr_101',
      token: 'jwt_token_sample_abc',
      expiresAt: Date.now() + 3600000
    };
  }

  public verifySession(token: string): boolean {
    return token.startsWith('jwt_');
  }
}
`,
  'src/db/Database.ts': `export class Database {
  private isConnected: boolean = false;

  public async connect(): Promise<void> {
    this.isConnected = true;
    console.log('Database connected.');
  }

  public query(sql: string): any[] {
    if (!this.isConnected) {
      this.connect();
    }
    return [{ id: 1, result: 'ok' }];
  }
}
`,
  'src/tests/auth.test.ts': `import { AuthService } from '../services/AuthService';
import { Database } from '../db/Database';

describe('AuthService Test Suite', () => {
  it('should authenticate user successfully', async () => {
    const db = new Database();
    const auth = new AuthService(db);
    const session = await auth.login('test@dev.com', 'password');
    expect(session.token).toBeDefined();
  });
});
`,
  'package.json': `{
  "name": "sample-project",
  "version": "1.0.0",
  "scripts": {
    "test": "vitest run",
    "build": "tsc"
  }
}
`
};
