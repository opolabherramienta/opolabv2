import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

// Execute the actual TS modules with explicit mocks; no Next server, env files,
// Supabase client, network connection or production credentials are loaded.
function load(file, mocks) {
  const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(js, { exports, URL, Set, console: { error() {} }, process: { env: {} }, require(name) {
    if (name === 'server-only') return {};
    // Pure text helper with no dependencies: use the real one.
    if (name === '@/lib/errors') return load('lib/errors.ts', {});
    if (!(name in mocks)) throw new Error(`Unmocked dependency: ${name}`);
    return mocks[name];
  }});
  return exports;
}
function redirect(path) { throw new Error(`REDIRECT:${path}`); }
function form(values) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) {
    for (const entry of Array.isArray(value) ? value : [value]) data.append(key, entry);
  }
  return data;
}
function authActions(client) {
  return load('app/auth/actions.ts', {
    'next/navigation': { redirect },
    '@/lib/supabase/server': { createClient: async () => client },
  });
}
const registration = { full_name: ' Student ', email: 'TEST@example.com', password: ' pass word ', accept_terms: 'on' };
test('signup without a session asks for confirmation and never writes profiles', async () => {
  let payload;
  const actions = authActions({ auth: { signUp: async (input) => {
    payload = input;
    return { data: { user: { id: 'a' }, session: null }, error: null };
  }}, from() { assert.fail('Profile writes are forbidden'); } });
  const result = await actions.signUpAction({}, form({ ...registration, role: 'admin', id: 'victim' }));
  assert.equal(result.error, '');
  assert.match(result.message, /correo/);
  assert.equal(payload.password, registration.password);
  assert.equal(payload.email, 'test@example.com');
  assert.deepEqual(Object.keys(payload.options.data), ['full_name']);
});
test('signup with immediate session goes to onboarding without profile upsert', async () => {
  const actions = authActions({ auth: { signUp: async () => ({
    data: { user: { id: 'a' }, session: {} }, error: null,
  }) }});
  await assert.rejects(actions.signUpAction({}, form(registration)), /REDIRECT:\/onboarding/);
});
test('signup failure returns an error', async () => {
  const actions = authActions({ auth: { signUp: async () => ({ data: {}, error: { message: 'failed' } }) }});
  const signUpError = (await actions.signUpAction({}, form(registration))).error;
  assert.match(signUpError, /No se pudo crear la cuenta/);
  // The raw text from Supabase never reaches the user.
  assert.doesNotMatch(signUpError, /failed/);
});
test('incomplete signup does not contact Auth', async () => {
  assert.match((await authActions({}).signUpAction({}, form({ email: 'a' }))).error, /Completa/);
});
test('login preserves password whitespace', async () => {
  const actions = authActions({ auth: { signInWithPassword: async (input) => {
    assert.equal(input.password, registration.password);
    return { error: null };
  } }});
  await assert.rejects(actions.signInAction({}, form(registration)), /REDIRECT:\/dashboard/);
});

for (const [label, user, authError, result, destination] of [
  ['anonymous', null, null, true, '/login'],
  ['invalid session', { id: 'a' }, {}, true, '/login'],
  ['student with forged metadata', { id: 'a', user_metadata: { role: 'admin' } }, null, false, '/dashboard'],
  ['missing RPC', { id: 'a' }, null, null, '/dashboard'],
  ['truthy non-boolean result', { id: 'a' }, null, 'true', '/dashboard'],
  ['administrator', { id: 'a' }, null, true, null],
]) {
  test(`server admin authorization: ${label}`, async () => {
    let rpcCalls = 0;
    const client = {
      auth: { getUser: async () => ({ data: { user }, error: authError }) },
      rpc: async (name) => {
        rpcCalls++;
        assert.equal(name, 'security_is_admin');
        return { data: result, error: result === null ? {} : null };
      },
    };
    const { requireAdmin } = load('lib/auth/authorization.ts', {
      'next/navigation': { redirect },
      '@/lib/supabase/server': { createClient: async () => client },
    });
    if (destination) await assert.rejects(requireAdmin(), { message: `REDIRECT:${destination}` });
    else assert.equal((await requireAdmin()).user, user);
    assert.equal(rpcCalls, !user || authError ? 0 : 1);
  });
}
test('admin revocation is checked on every invocation', async () => {
  let admin = true;
  const { requireAdmin } = load('lib/auth/authorization.ts', {
    'next/navigation': { redirect },
    '@/lib/supabase/server': { createClient: async () => ({
      auth: { getUser: async () => ({ data: { user: { id: 'a' } }, error: null }) },
      rpc: async () => ({ data: admin, error: null }),
    }) },
  });
  await requireAdmin();
  admin = false;
  await assert.rejects(requireAdmin(), /REDIRECT:\/dashboard/);
});

const onboarding = {
  user_id: 'victim', education_stage_id: 'stage', specialty_id: 'specialty',
  autonomous_community_id: 'community', opposition_date: '2027-06-01',
  weekly_available_hours: '10', default_topic_duration_minutes: '60',
  default_practical_duration_minutes: '90', main_goal: 'Study', available_days: ['monday'],
};
for (const signedIn of [false, true]) {
  test(`onboarding direct action invocation, authenticated=${signedIn}`, async () => {
    let writes = 0;
    const { saveOnboardingAction } = load('app/onboarding/actions.ts', {
      'next/navigation': { redirect },
      '@/lib/supabase/server': { createClient: async () => ({
        auth: { getUser: async () => ({ data: { user: signedIn ? { id: 'real-user' } : null }, error: null }) },
        from: (name) => ({ upsert: async (payload, options) => {
          writes++;
          assert.equal(name, 'user_opposition_profiles');
          assert.equal(payload.user_id, 'real-user');
          assert.equal(options.onConflict, 'user_id');
          assert.equal(payload.role, undefined);
          return { error: null };
        } }),
      }) },
    });
    await assert.rejects(saveOnboardingAction({}, form(onboarding)), {
      message: `REDIRECT:${signedIn ? '/dashboard' : '/login'}`,
    });
    assert.equal(writes, signedIn ? 1 : 0);
  });
}
for (const success of [false, true]) {
  test(`PKCE callback has a fixed destination, success=${success}`, async () => {
    const { GET } = load('app/auth/callback/route.ts', {
      'next/server': { NextResponse: { redirect: (url) => url.href } },
      '@/lib/supabase/server': { createClient: async () => ({ auth: {
        exchangeCodeForSession: async (code) => {
          assert.equal(code, 'test-code');
          return { error: success ? null : {} };
        },
      } }) },
    });
    const url = 'http://localhost:3000/auth/callback?code=test-code&next=https://evil.invalid';
    assert.equal(await GET({ url, nextUrl: new URL(url) }),
      `http://localhost:3000/${success ? 'onboarding' : 'login?confirmation=failed'}`);
  });
}
test('all admin entry points enforce server authorization', () => {
  for (const file of [
    'app/admin/layout.tsx', 'app/admin/page.tsx', 'app/admin/usuarios/page.tsx',
    'app/admin/temas/page.tsx', 'app/admin/especialidades/page.tsx',
    'app/admin/sugerencias/page.tsx',
  ]) assert.match(fs.readFileSync(file, 'utf8'), /await requireAdmin\(\)/, file);
});

for (const outcome of ['success', 'invalid', 'missing']) {
  test(`email token confirmation: ${outcome}`, async () => {
    let calls = 0;
    const { GET } = load('app/auth/confirm/route.ts', {
      'next/server': { NextResponse: { redirect: (url) => url.href } },
      '@/lib/supabase/server': { createClient: async () => ({ auth: {
        verifyOtp: async (input) => {
          calls++;
          assert.equal(input.token_hash, 'synthetic-token');
          assert.equal(input.type, 'email');
          return { error: outcome === 'success' ? null : {} };
        },
      } }) },
    });
    const url = 'http://localhost:3000/auth/confirm?next=https://evil.invalid&type=recovery' +
      (outcome === 'missing' ? '' : '&token_hash=synthetic-token');
    assert.equal(await GET({ url, nextUrl: new URL(url) }),
      `http://localhost:3000/${outcome === 'success' ? 'onboarding' : 'login?confirmation=failed'}`);
    assert.equal(calls, outcome === 'missing' ? 0 : 1);
  });
}

function passwordActions(client, host = 'localhost:3000') {
  return load('app/auth/password-actions.ts', {
    'next/navigation': { redirect },
    'next/headers': { headers: async () => ({ get: (name) => (name === 'host' ? host : null) }) },
    '@/lib/supabase/server': { createClient: async () => client },
  });
}
for (const [label, error] of [['known address', null], ['unknown address', { status: 400, message: 'User not found' }]]) {
  test(`password reset request gives the same answer: ${label}`, async () => {
    let call;
    const actions = passwordActions({ auth: { resetPasswordForEmail: async (email, options) => {
      call = { email, options };
      return { error };
    } } });
    const result = await actions.requestPasswordResetAction({}, form({ email: ' TEST@example.com ' }));
    assert.equal(result.error, '');
    assert.match(result.message, /Si hay una cuenta/);
    assert.equal(call.email, 'test@example.com');
    assert.equal(call.options.redirectTo, 'http://localhost:3000/auth/recovery');
  });
}
test('password update without a session never calls updateUser', async () => {
  const actions = passwordActions({ auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    updateUser: async () => assert.fail('must not update'),
  } });
  await assert.rejects(
    actions.updatePasswordAction({}, form({ password: 'long enough', password_confirmation: 'long enough' })),
    /REDIRECT:\/forgot-password/,
  );
});
test('password update rejects short or mismatched passwords before contacting Auth', async () => {
  const actions = passwordActions({});
  assert.match((await actions.updatePasswordAction({}, form({ password: 'short', password_confirmation: 'short' }))).error, /al menos 8/);
  assert.match((await actions.updatePasswordAction({}, form({ password: 'long enough', password_confirmation: 'different one' }))).error, /no coinciden/);
});
test('password update changes only the signed-in user password', async () => {
  let payload;
  const actions = passwordActions({ auth: {
    getUser: async () => ({ data: { user: { id: 'a' } }, error: null }),
    updateUser: async (input) => { payload = input; return { error: null }; },
  } });
  await assert.rejects(
    actions.updatePasswordAction({}, form({ password: ' pass word ', password_confirmation: ' pass word ', role: 'admin' })),
    /REDIRECT:\/dashboard/,
  );
  assert.equal(payload.password, ' pass word ');
  assert.deepEqual(Object.keys(payload), ['password']);
});
for (const [label, query, error, destination] of [
  ['code success', 'code=abc', null, '/reset-password'],
  ['token success', 'token_hash=abc', null, '/reset-password'],
  ['invalid', 'code=abc', {}, '/forgot-password?enlace=caducado'],
  ['missing', 'next=https://evil.example', null, '/forgot-password?enlace=caducado'],
]) {
  test(`password recovery link: ${label}`, async () => {
    const { GET } = load('app/auth/recovery/route.ts', {
      'next/server': { NextResponse: { redirect: (url) => url } },
      '@/lib/supabase/server': { createClient: async () => ({ auth: {
        exchangeCodeForSession: async () => ({ error }),
        verifyOtp: async (input) => { assert.equal(input.type, 'recovery'); return { error }; },
      } }) },
    });
    const url = new URL(`http://localhost:3000/auth/recovery?${query}`);
    const target = await GET({ nextUrl: url, url: url.href });
    assert.equal(target.pathname + target.search, destination);
  });
}
