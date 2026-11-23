// Regression tests for promptStorage.js — finding #6 (transact re-reads fresh
// state inside the write lock so a stale snapshot cannot clobber concurrent edits).

let mod;
const mem = {};

beforeAll(async () => {
  global.chrome = {
    storage: {
      local: {
        get: (keys, cb) => {
          const out = {};
          (Array.isArray(keys) ? keys : [keys]).forEach(k => { if (k in mem) out[k] = mem[k]; });
          cb(out);
        },
        set: (obj, cb) => { Object.assign(mem, obj); cb(); },
        remove: (keys, cb) => { (Array.isArray(keys) ? keys : [keys]).forEach(k => delete mem[k]); cb(); },
      },
      onChanged: { addListener() {}, removeListener() {} },
    },
    runtime: { lastError: null },
  };
  mod = await import('../promptStorage.js');
});

describe('transact (#6)', () => {
  test('re-reads the freshest store, preserving an edit committed after the snapshot', async () => {
    await mod.setPrompts([{ uuid: 'a', title: 'A', content: 'a' }]);

    // The sync cycle snapshots here...
    const snapshot = await mod.getPrompts();
    expect(snapshot.map(p => p.uuid)).toEqual(['a']);

    // ...then a user edit commits during the cycle's async span.
    await mod.savePrompt({ uuid: 'b', title: 'B', content: 'b' });

    // transact must see 'b' (fresh read inside the lock), not the stale snapshot.
    let saw;
    await mod.transact((prompts, folders) => {
      saw = prompts.map(p => p.uuid);
      return { prompts: prompts.map(p => p.uuid === 'a' ? { ...p, content: 'a2' } : p), folders };
    });
    expect(saw).toContain('b');

    const final = await mod.getPrompts();
    expect(final.find(p => p.uuid === 'b')).toBeDefined(); // concurrent edit survived
    expect(final.find(p => p.uuid === 'a').content).toBe('a2');
  });

  test('returning null skips the write', async () => {
    const before = await mod.getPrompts();
    const r = await mod.transact(() => null);
    expect(r).toBeNull();
    const after = await mod.getPrompts();
    expect(after.map(p => p.uuid)).toEqual(before.map(p => p.uuid));
  });
});

describe('reorderPrompts / removeTagEverywhere (#36)', () => {
  test('reorder preserves prompts added after the render-time snapshot', async () => {
    await mod.setPrompts([{ uuid: 'a', title: 'A', content: 'a' }, { uuid: 'b', title: 'B', content: 'b' }]);
    // A new prompt is saved elsewhere after the panel rendered its list.
    await mod.savePrompt({ uuid: 'c', title: 'C', content: 'c' });
    // Panel reorders using its stale snapshot order [b, a]; 'c' must survive.
    const ordered = await mod.reorderPrompts(['b', 'a']);
    expect(ordered.map(p => p.uuid)).toEqual(['b', 'a', 'c']);
  });

  test('removeTagEverywhere strips the tag from all prompts and returns them', async () => {
    await mod.setPrompts([
      { uuid: 'a', title: 'A', content: 'a', tags: ['x', 'y'] },
      { uuid: 'b', title: 'B', content: 'b', tags: ['x'] },
    ]);
    const updated = await mod.removeTagEverywhere('x');
    expect(updated.find(p => p.uuid === 'a').tags).toEqual(['y']);
    expect(updated.find(p => p.uuid === 'b').tags).toEqual([]);
  });
});

describe('savePrompt upsert / restoreVersion / addTagToPrompt (#55/#56/#59)', () => {
  test('#55: upsert with omitted fields preserves tags/language/groupId', async () => {
    await mod.setPrompts([{ uuid: 'a', title: 'A', content: 'a', tags: ['x'], language: 'zh-HK', groupId: 'g1' }]);
    await mod.savePrompt({ uuid: 'a', title: 'A2', content: 'a2' }); // omits tags/language/groupId
    const p = (await mod.getPrompts()).find(x => x.uuid === 'a');
    expect(p.title).toBe('A2');
    expect(p.tags).toEqual(['x']);
    expect(p.language).toBe('zh-HK');
    expect(p.groupId).toBe('g1');
  });

  test('#56: restoreVersion restores the chosen version content', async () => {
    await mod.setPrompts([{ uuid: 'a', title: 'A', content: 'v1' }]);
    await mod.addVersion('a', 'v2');
    await mod.addVersion('a', 'v3');
    await mod.restoreVersion('a', 0); // restore v1
    const p = (await mod.getPrompts()).find(x => x.uuid === 'a');
    expect(p.content).toBe('v1');
  });

  test('#59: addTagToPrompt with empty tag returns the prompt, not an array', async () => {
    await mod.setPrompts([{ uuid: 'a', title: 'A', content: 'a' }]);
    const r = await mod.addTagToPrompt('a', '');
    expect(Array.isArray(r)).toBe(false);
    expect(r.uuid).toBe('a');
  });
});
