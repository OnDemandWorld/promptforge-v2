// Regression tests for sync/syncEngine.js mergeAll (pure function).
// Focus: finding #5 — a pull-only cycle must refresh the shadow so a later
// local deletion propagates as a tombstone instead of being resurrected.

let mergeAll;

// Mirror of syncEngine.promptDigest (internal) so tests can build shadow state.
function digest(p) {
  return JSON.stringify([
    p.title || '', p.content || '', p.tags || [], p.category || null,
    p.categoryId || null, p.language || null, p.groupId || null, p.folderId || null,
    !!p.favorite, !!p._archived,
    (p.versions || []).map(v => [v.content, v.source]),
  ]);
}
function shadowOf(prompts) {
  return { prompts: Object.fromEntries(prompts.map(p => [p.uuid, digest(p)])), folders: {}, tombstones: [] };
}
const base = (uuid, content) => ({
  uuid, title: 'T', content, tags: [], category: null, categoryId: null,
  language: null, groupId: null, folderId: null, favorite: false, versions: [],
  createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
});

beforeAll(async () => {
  global.chrome = {
    storage: { local: { get: async () => ({}), set: async () => {}, remove: async () => {} }, onChanged: { addListener() {}, removeListener() {} } },
    runtime: { connect: () => ({ onMessage: { addListener() {} }, onDisconnect: { addListener() {} }, postMessage() {} }), getURL: (p) => p },
  };
  ({ mergeAll } = await import('../sync/syncEngine.js'));
});

describe('mergeAll deletion propagation (#5)', () => {
  test('pull-only cycle then local delete: with refreshed shadow, deletion becomes a tombstone', () => {
    const localV1 = base('x', 'v1');
    const remoteV2 = { ...base('x', 'v2'), updatedAt: '2026-02-01T00:00:00.000Z' };
    const shadowV1 = shadowOf([localV1]);

    // Cycle 1: local pulls the remote edit (localChanged, remoteChanged=false).
    const c1 = mergeAll([localV1], [], { prompts: [remoteV2], folders: [], tombstones: [] }, shadowV1, 'devA');
    expect(c1.localChanged).toBe(true);
    expect(c1.remoteChanged).toBe(false);
    expect(c1.prompts.find(p => p.uuid === 'x').content).toBe('v2');

    // The FIX (#5): shadow is refreshed to the merged state even though no
    // file write happened. Cycle 2: user deletes x locally.
    const refreshedShadow = shadowOf(c1.prompts);
    const c2 = mergeAll([], [], { prompts: [remoteV2], folders: [], tombstones: [] }, refreshedShadow, 'devA');
    expect(c2.prompts.find(p => p.uuid === 'x')).toBeUndefined();
    expect(c2.tombstones.some(t => t.uuid === 'x')).toBe(true);
  });

  test('stale shadow (pre-fix behavior) resurrects a locally deleted prompt', () => {
    const localV1 = base('x', 'v1');
    const remoteV2 = { ...base('x', 'v2'), updatedAt: '2026-02-01T00:00:00.000Z' };
    const staleShadow = shadowOf([localV1]); // NOT refreshed after the pull

    // User deleted x locally; remote still has v2 which differs from stale shadow.
    const c = mergeAll([], [], { prompts: [remoteV2], folders: [], tombstones: [] }, staleShadow, 'devA');
    // Documents the bug the fix prevents: remote edit wins, prompt comes back.
    expect(c.prompts.find(p => p.uuid === 'x')).toBeDefined();
    expect(c.tombstones.some(t => t.uuid === 'x')).toBe(false);
  });

  test('new local prompt is pushed to the file', () => {
    const p = base('new', 'hello');
    const r = mergeAll([p], [], { prompts: [], folders: [], tombstones: [] }, { prompts: {}, folders: {}, tombstones: [] }, 'devA');
    expect(r.remoteChanged).toBe(true);
    expect(r.prompts.find(x => x.uuid === 'new')).toBeDefined();
  });

  test('remote tombstone deletes an unchanged local prompt', () => {
    const p = base('x', 'v1');
    const shadow = shadowOf([p]);
    const tomb = { uuid: 'x', deletedAt: '2026-03-01T00:00:00.000Z', rev: 2 };
    const r = mergeAll([p], [], { prompts: [], folders: [], tombstones: [tomb] }, shadow, 'devA');
    expect(r.prompts.find(x => x.uuid === 'x')).toBeUndefined();
    expect(r.localChanged).toBe(true);
  });
});
