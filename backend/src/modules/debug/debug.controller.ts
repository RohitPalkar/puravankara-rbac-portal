import { Controller, Get, Post, Body } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Public } from '../auth/decorators/public.decorator';

@Controller('debug')
export class DebugController {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  @Public()
  @Get('db')
  async db() {
    try {
      const colsSessions: any[] = await this.ds.query(`SELECT column_name FROM information_schema.columns WHERE table_name='user_sessions' ORDER BY ordinal_position`);
      const colsRoles: any[] = await this.ds.query(`SELECT column_name FROM information_schema.columns WHERE table_name='user_roles' ORDER BY ordinal_position`);
      const colsProfiles: any[] = await this.ds.query(`SELECT column_name FROM information_schema.columns WHERE table_name='permission_profiles' ORDER BY ordinal_position`);
      const migrations: any[] = await this.ds.query(`SELECT name FROM migrations ORDER BY id DESC LIMIT 10`).catch(async () => {
        try { return await this.ds.query(`SELECT name FROM typeorm_migrations ORDER BY timestamp DESC LIMIT 10`); } catch { return []; }
      });
      const zones: any[] = await this.ds.query(`SELECT id, name FROM zones LIMIT 5`).catch(e => [{ error: e.message }]);
      return {
        user_sessions: colsSessions.map((r: any) => r.column_name),
        user_roles: colsRoles.map((r: any) => r.column_name),
        permission_profiles: colsProfiles.map((r: any) => r.column_name),
        migrations: migrations.map((r: any) => r.name),
        zones,
      };
    } catch (e: any) {
      return { error: e.message, stack: e.stack?.slice(0, 2000) };
    }
  }

  @Public()
  @Get('health2')
  async health2() {
    try {
      const users: any[] = await this.ds.query(`SELECT emp_id, email FROM users LIMIT 3`);
      const roles: any[] = await this.ds.query(`SELECT id, name FROM roles LIMIT 5`);
      return { users, roles };
    } catch (e: any) {
      return { error: e.message };
    }
  }

  @Public()
  @Post('migrate-active-role')
  async migrateActiveRole() {
    const stmts: string[] = [];
    const run = async (sql: string, label: string) => {
      try {
        await this.ds.query(sql);
        stmts.push(`${label}: ok`);
      } catch (e: any) {
        stmts.push(`${label}: ${e.message.slice(0, 200)}`);
      }
    };
    await run(`ALTER TABLE "user_sessions" ADD COLUMN IF NOT EXISTS "active_role_id" integer NULL`, 'add active_role_id');
    await run(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_user_sessions_active_role') THEN ALTER TABLE "user_sessions" ADD CONSTRAINT "FK_user_sessions_active_role" FOREIGN KEY ("active_role_id") REFERENCES "roles"("id") ON DELETE SET NULL; END IF; END $$;`, 'fk active_role');
    await run(`CREATE INDEX IF NOT EXISTS "IDX_user_sessions_active_role" ON "user_sessions" ("active_role_id")`, 'idx sessions');
    await run(`ALTER TABLE "user_roles" ADD COLUMN IF NOT EXISTS "expires_at" timestamptz NULL`, 'add expires_at user_roles');
    await run(`ALTER TABLE "user_roles" ADD COLUMN IF NOT EXISTS "role_type" varchar(20) NULL`, 'add role_type');
    await run(`CREATE INDEX IF NOT EXISTS "IDX_user_roles_expires_at" ON "user_roles" ("expires_at") WHERE "expires_at" IS NOT NULL`, 'idx roles expires');
    await run(`WITH ranked AS (SELECT id, user_id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY assigned_at NULLS FIRST, id ASC) AS rn FROM "user_roles" WHERE "role_type" IS NULL) UPDATE "user_roles" ur SET "role_type" = CASE WHEN r.rn = 1 THEN 'PRIMARY' ELSE 'SECONDARY' END FROM ranked r WHERE ur.id = r.id`, 'backfill role_type');
    await run(`ALTER TABLE "permission_profiles" ADD COLUMN IF NOT EXISTS "expires_at" timestamptz NULL`, 'add expires_at profiles');
    await run(`CREATE INDEX IF NOT EXISTS "IDX_permission_profiles_expires_at" ON "permission_profiles" ("expires_at") WHERE "expires_at" IS NOT NULL`, 'idx profiles');
    // verify
    const colsS: any[] = await this.ds.query(`SELECT column_name FROM information_schema.columns WHERE table_name='user_sessions' ORDER BY ordinal_position`).catch(() => []);
    const colsR: any[] = await this.ds.query(`SELECT column_name FROM information_schema.columns WHERE table_name='user_roles' ORDER BY ordinal_position`).catch(() => []);
    const colsP: any[] = await this.ds.query(`SELECT column_name FROM information_schema.columns WHERE table_name='permission_profiles' ORDER BY ordinal_position`).catch(() => []);
    return { stmts, user_sessions: colsS.map((r: any) => r.column_name), user_roles: colsR.map((r: any) => r.column_name), permission_profiles: colsP.map((r: any) => r.column_name) };
  }

  @Public()
  @Post('login-test')
  async loginTest(@Body() body: any) {
    try {
      const { email, password } = body;
      const users: any[] = await this.ds.query(`SELECT emp_id, email, is_active FROM users WHERE email = $1`, [email]);
      if (!users.length) return { step: 'user not found', email };
      const user = users[0];
      const auth: any[] = await this.ds.query(`SELECT user_id, password_hash, is_locked, auth_provider FROM user_auth WHERE user_id = $1`, [user.emp_id]);
      if (!auth.length) return { step: 'user_auth not found', user };
      // try bcrypt
      const bcrypt = await import('bcrypt');
      const ok = await bcrypt.compare(password, auth[0].password_hash);
      if (!ok) return { step: 'bcrypt compare false', user, auth: { ...auth[0], password_hash: auth[0].password_hash.slice(0, 10) + '...' } };
      // try user_roles
      const roles: any[] = await this.ds.query(`SELECT * FROM user_roles WHERE user_id = $1 LIMIT 5`, [user.emp_id]).catch((e: any) => [{ error: e.message }]);
      return { step: 'ok', user, roles: roles.slice(0, 3), bcrypt: ok };
    } catch (e: any) {
      return { error: e.message, stack: e.stack?.slice(0, 3000) };
    }
  }
}
