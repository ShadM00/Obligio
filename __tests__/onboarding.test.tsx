/**
 * @format
 */
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import {Onboarding} from '../src/screens';
import {COUNTRIES, INDUSTRIES, US_STATES} from '../src/jurisdictions';
import {locales} from '../src/i18n';

const copy = locales['en-US'];

function renderOnboarding() {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <Onboarding copy={copy} onCreate={() => undefined} busy={false} error={null} onSignOut={() => undefined} />,
    );
  });
  return tree;
}

function textsIn(tree: ReactTestRenderer.ReactTestRenderer): string[] {
  return tree.root.findAllByType('Text' as never).flatMap(node =>
    node.children.filter((child): child is string => typeof child === 'string'),
  );
}

/** Field labels are rendered upper-cased, so compare against that form. */
function label(text: string): string {
  return text.toUpperCase();
}

describe('Onboarding', () => {
  it('hides the country chooser while only one country is offered', () => {
    // A single chip the owner cannot change is noise. If a second reviewed
    // catalogue is ever added, the chooser has to come back.
    expect(COUNTRIES).toHaveLength(1);
    expect(textsIn(renderOnboarding())).not.toContain(label(copy.country));
  });

  it('still asks for region and industry, which decide what is suggested', () => {
    const texts = textsIn(renderOnboarding());
    expect(texts).toContain(label(copy.region));
    expect(texts).toContain(label(copy.industry));
  });

  it('offers the US regions and industries the catalogue is keyed on', () => {
    const texts = textsIn(renderOnboarding());
    expect(texts).toContain(US_STATES.find(s => s.value === 'WA')!.label);
    expect(texts).toContain(INDUSTRIES.find(i => i.value === 'General')!.label);
  });
});
