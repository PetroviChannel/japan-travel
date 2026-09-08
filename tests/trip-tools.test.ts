import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerTripTools } from '../app/trip-tools';
import { defaultPurchases } from '../app/local-purchases';
import type { SavedPurchase } from '../app/purchase-state';

test('assistant edits retain the server version for optimistic concurrency', async () => {
  const registered = new Map<
    string,
    { execute: (input: unknown) => unknown }
  >();
  const originalDocument = Object.getOwnPropertyDescriptor(
    globalThis,
    'document',
  );
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: {
      modelContext: {
        registerTool: (tool: {
          name: string;
          execute: (input: unknown) => unknown;
        }) => registered.set(tool.name, tool),
      },
    },
  });
  try {
    const records = defaultPurchases(),
      row = Object.values(records)[0];
    row.updatedAt = 1720000000000;
    let forwarded: SavedPurchase | undefined;
    const unregister = registerTripTools(
      () => records,
      async (value) => {
        forwarded = value;
        records[value.id] = { ...value, updatedAt: 1720000000001 };
        return records[value.id];
      },
    );
    await registered
      .get('update_purchase_record')!
      .execute({ id: row.id, note: 'Confirmed booking' });
    assert.equal(forwarded!.updatedAt, 1720000000000);
    assert.equal(forwarded!.note, 'Confirmed booking');
    unregister?.();
  } finally {
    if (originalDocument)
      Object.defineProperty(globalThis, 'document', originalDocument);
    else Reflect.deleteProperty(globalThis, 'document');
  }
});
