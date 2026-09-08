/**
 * @format
 */
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {Text} from 'react-native';

import {ErrorBoundary} from '../src/ErrorBoundary';
import {locales} from '../src/i18n';

const copy = locales['en-US'];

function Boom(): React.ReactElement {
  throw new Error('render exploded');
}

function texts(tree: ReactTestRenderer.ReactTestRenderer): string[] {
  return tree.root
    .findAllByType('Text' as never)
    .flatMap(node => node.children.filter((child): child is string => typeof child === 'string'));
}

describe('ErrorBoundary', () => {
  let logged: jest.SpyInstance;
  beforeEach(() => {
    // React logs the caught error itself; keep the suite output readable.
    logged = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => logged.mockRestore());

  it('renders its children when nothing throws', () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <ErrorBoundary>
          <Text>all is well</Text>
        </ErrorBoundary>,
      );
    });
    expect(texts(tree)).toContain('all is well');
  });

  it('shows a recovery screen instead of a blank one', () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <ErrorBoundary>
          <Boom />
        </ErrorBoundary>,
      );
    });
    const shown = texts(tree);
    expect(shown).toContain(copy.crashTitle);
    expect(shown).toContain(copy.tryAgain);
  });

  it('reassures that nothing was lost, because the data is not on the device', () => {
    expect(copy.crashBody).toMatch(/nothing has been lost/i);
  });

  it('recovers when retried', () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    let shouldThrow = true;
    function Flaky() {
      if (shouldThrow) {
        throw new Error('render exploded');
      }
      return <Text>recovered</Text>;
    }
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <ErrorBoundary>
          <Flaky />
        </ErrorBoundary>,
      );
    });
    expect(texts(tree)).toContain(copy.crashTitle);

    shouldThrow = false;
    const retry = tree.root.findAll(node => node.props.accessibilityRole === 'button')[0];
    ReactTestRenderer.act(() => retry.props.onPress());
    expect(texts(tree)).toContain('recovered');
  });
});
