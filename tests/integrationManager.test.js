// Regression test for integration-manager.js — finding #16: a transient fetch
// failure must not permanently cache an empty provider list.

let getProviders;

beforeAll(async () => {
  global.chrome = { runtime: { getURL: (p) => p } };
  ({ getProviders } = await import('../integration-manager.js'));
});

test('#16: provider list recovers on the next call after a transient failure', async () => {
  let calls = 0;
  global.fetch = async () => {
    calls++;
    if (calls === 1) throw new Error('transient I/O');
    return { ok: true, json: async () => ({ llm_providers: [{ name: 'ChatGPT', pattern: '*://chatgpt.com/*' }] }) };
  };

  const first = await getProviders();
  expect(first).toEqual([]); // failed, but NOT cached

  const second = await getProviders();
  expect(second).toHaveLength(1); // retried and succeeded
  expect(second[0].id).toBe('chatgpt');
});
