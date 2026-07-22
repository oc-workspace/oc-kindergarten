import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  AGENT_APPEARANCE_PRESETS,
  DEFAULT_AGENT_APPEARANCE_PRESET,
} from '../lib/agent-registry-contract';

const root = process.cwd();
const colorwayRoot = resolve(
  root,
  'assets/design/sprites/characters/v2/colorways/v1/meadow',
);
const approvalLockRelative =
  'assets/design/sprites/characters/v2/colorways/v1/approved/meadow-runtime-lock-v1.json';
const characters = [
  ['ai-agent-child-boy', 'boy-child'],
  ['ai-agent-child-girl', 'girl-child'],
  ['ai-agent-child-genderless', 'genderless-child'],
] as const;
const actions = [
  'researching',
  'writing',
  'executing',
  'syncing',
  'error',
] as const;

function pngSize(path: string): readonly [number, number] {
  const bytes = readFileSync(path);
  assert.equal(bytes.subarray(1, 4).toString('ascii'), 'PNG');
  return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
}

function metadata(path: string) {
  return JSON.parse(readFileSync(path, 'utf8')) as {
    status: string;
    approval_lock: string;
    approved_on: string;
    qc:
      | Array<Record<string, unknown>>
      | Record<string, Array<Record<string, unknown>>>;
  };
}

function sha256(path: string) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function assertQc(qc: Record<string, unknown>) {
  assert.equal(qc.anchor_matches_reference, true);
  assert.equal(qc.visible_magenta_pixels, 0);
  assert.equal(qc.chroma_fringe_pixels, 0);
  assert.equal(qc.touches_edge, false);
  assert(Number(qc.meadow_pixels) >= 12);
}

assert.deepEqual(AGENT_APPEARANCE_PRESETS, ['classic', 'meadow']);
assert.equal(DEFAULT_AGENT_APPEARANCE_PRESET, 'classic');

let runtimeSheetCount = 0;
for (const [directory, prefix] of characters) {
  const characterRoot = resolve(colorwayRoot, directory);
  const idleRoot = resolve(characterRoot, 'idle');
  const idleRuntime = resolve(
    idleRoot,
    `${prefix}-idle-meadow-v1-strip-48x64.png`,
  );
  assert.deepEqual(pngSize(idleRuntime), [192, 64]);
  const idleMetadata = metadata(
    resolve(idleRoot, `${prefix}-idle-meadow-v1-meta.json`),
  );
  assert.equal(idleMetadata.status, 'approved');
  assert.equal(idleMetadata.approval_lock, approvalLockRelative);
  assert.equal(idleMetadata.approved_on, '2026-07-22');
  assert(Array.isArray(idleMetadata.qc));
  idleMetadata.qc.forEach(assertQc);
  if (directory === 'ai-agent-child-boy') {
    idleMetadata.qc.forEach((qc) =>
      assert(Number(qc.purple_palette_pixels) >= 6),
    );
  }
  runtimeSheetCount += 1;

  for (const action of actions) {
    const actionRoot = resolve(characterRoot, 'actions/v1', action);
    assert.deepEqual(
      pngSize(
        resolve(
          actionRoot,
          `${prefix}-${action}-meadow-v1-strip-48x64.png`,
        ),
      ),
      [192, 64],
    );
    const actionMetadata = metadata(
      resolve(actionRoot, `${prefix}-${action}-meadow-v1-meta.json`),
    );
    assert.equal(actionMetadata.status, 'approved');
    assert.equal(actionMetadata.approval_lock, approvalLockRelative);
    assert.equal(actionMetadata.approved_on, '2026-07-22');
    assert(Array.isArray(actionMetadata.qc));
    actionMetadata.qc.forEach(assertQc);
    if (directory === 'ai-agent-child-boy') {
      actionMetadata.qc.forEach((qc) =>
        assert(Number(qc.purple_palette_pixels) >= 6),
      );
      if (action === 'executing' || action === 'error') {
        actionMetadata.qc.forEach((qc) =>
          assert(
            Number(qc.reference_alpha_iou) >= 0.95,
            `${action} 必须保持经典批准帧的造型，仅允许换色`,
          ),
        );
      }
    }
    runtimeSheetCount += 1;
  }

  const movementRoot = resolve(characterRoot, 'moving/v1');
  assert.deepEqual(
    pngSize(
      resolve(
        movementRoot,
        `${prefix}-move-8dir-4frame-meadow-v1-48x64.png`,
      ),
    ),
    [192, 512],
  );
  const movementMetadata = metadata(
    resolve(
      movementRoot,
      `${prefix}-move-8dir-4frame-meadow-v1-meta.json`,
    ),
  );
  assert.equal(movementMetadata.status, 'approved');
  assert.equal(movementMetadata.approval_lock, approvalLockRelative);
  assert.equal(movementMetadata.approved_on, '2026-07-22');
  assert(!Array.isArray(movementMetadata.qc));
  const directions = Object.values(movementMetadata.qc);
  assert.equal(directions.length, 8);
  directions.flat().forEach(assertQc);
  if (directory === 'ai-agent-child-boy') {
    directions
      .flat()
      .forEach((qc) => assert(Number(qc.purple_palette_pixels) >= 6));
  }
  runtimeSheetCount += 1;
}

assert.equal(runtimeSheetCount, 21);

const approvalLock = JSON.parse(
  readFileSync(resolve(root, approvalLockRelative), 'utf8'),
) as {
  lock_id: string;
  status: string;
  preset: string;
  locked_file_count: number;
  files: Array<{ path: string; sha256: string }>;
};
assert.equal(approvalLock.lock_id, 'meadow-runtime-lock-v1');
assert.equal(approvalLock.status, 'approved');
assert.equal(approvalLock.preset, 'meadow');
assert.equal(approvalLock.locked_file_count, 231);
assert.equal(approvalLock.files.length, 231);
for (const file of approvalLock.files) {
  assert.equal(sha256(resolve(root, file.path)), file.sha256, file.path);
}
console.log(
  'Agent appearance regression passed: classic fallback, 21 Meadow runtime sheets and 231-file approval lock',
);
