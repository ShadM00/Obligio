/// <reference types="node" />
import * as fs from 'fs';
import * as path from 'path';

import {screenshotRequirements, spanishScreenshotRequirements} from '../src/screenshots/fixtures';
import type {Requirement} from '../src/types';
import {makeWatchSnapshot} from '../src/watch';

/**
 * The sample data the watch apps load when capturing store screenshots.
 *
 * It is produced by the phone's own makeWatchSnapshot, from the same sample
 * obligations as the phone screenshots, so a listing shows exactly what a
 * real phone would send a real watch -- translations and date formats
 * included. The files are committed so the capture script needs no build
 * step, and this test fails the moment they drift from what the phone sends.
 *
 *   UPDATE_WATCH_FIXTURES=1 npx jest watchFixtures
 */
const DIR = path.join(__dirname, '..', 'scripts', 'watch-fixtures');
const business = {_id: 'screenshot-business', ownerId: 'screenshot-owner', name: 'Harbor Street Bakery'};

const withIds = (items: Requirement[]) =>
  items.map((item, index) => ({...item, _id: `screenshot-${index + 1}`}) as Requirement);

const fixtures = {
  'en-US': makeWatchSnapshot(business, withIds(screenshotRequirements), 'en-US'),
  'es-US': makeWatchSnapshot(business, withIds(spanishScreenshotRequirements), 'es-US'),
};

describe.each(Object.entries(fixtures))('%s watch fixture', (locale, snapshot) => {
  // Wall-clock time would make the file change on every run; the capture
  // script stamps a real sync time when it launches the watch.
  const expected = {...snapshot, updatedAt: 0};
  const file = path.join(DIR, `${locale}.json`);

  it('matches what the phone would send', () => {
    if (process.env.UPDATE_WATCH_FIXTURES) {
      fs.mkdirSync(DIR, {recursive: true});
      fs.writeFileSync(file, `${JSON.stringify(expected, null, 2)}\n`);
    }
    expect(JSON.parse(fs.readFileSync(file, 'utf8'))).toEqual(expected);
  });

  it('shows open deadlines first, which is what makes a good first screen', () => {
    expect(snapshot.items[0].status).not.toBe('current');
    expect(snapshot.items.at(-1)!.status).toBe('current');
  });
});
