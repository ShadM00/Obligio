/**
 * @format
 */
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {TouchableOpacity} from 'react-native';

import {SettingsScreen} from '../src/screens';
import {locales} from '../src/i18n';

const copy = locales['en-US'];

function render(overrides: Partial<React.ComponentProps<typeof SettingsScreen>> = {}) {
  const props: React.ComponentProps<typeof SettingsScreen> = {
    copy,
    onSubscribe: jest.fn(),
    onEnableNotifications: jest.fn(),
    onOpenPrivacy: jest.fn(),
    onOpenSupport: jest.fn(),
    onDeleteAccount: jest.fn(),
    notificationsEnabled: true,
    billingAvailable: true,
    isPlus: false,
    onSignOut: jest.fn(),
    signOutLabel: copy.signOut,
    ...overrides,
  };
  let tree!: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<SettingsScreen {...props} />);
  });
  return {tree, props};
}

/**
 * The touchables, one per row.
 *
 * Not `findAll(accessibilityRole === 'button')`: a TouchableOpacity renders
 * five nested nodes that all inherit the role, and the inner ones carry the
 * row's text without its onPress -- which reads as a chevron on an untappable
 * row when it is nothing of the sort.
 */
function touchables(tree: ReactTestRenderer.ReactTestRenderer) {
  return tree.root.findAllByType(TouchableOpacity);
}

function textsOf(node: ReactTestRenderer.ReactTestInstance): string[] {
  return node
    .findAllByType('Text' as never)
    .flatMap(text => text.children.filter((child): child is string => typeof child === 'string'));
}

/** The row whose title matches. */
function row(tree: ReactTestRenderer.ReactTestRenderer, label: string) {
  return touchables(tree).find(button => textsOf(button).includes(label));
}

describe('SettingsScreen', () => {
  it('opens the privacy and support pages the store listing points at', () => {
    const {tree, props} = render();
    ReactTestRenderer.act(() => row(tree, copy.privacyAndData)!.props.onPress());
    ReactTestRenderer.act(() => row(tree, copy.helpAndSupport)!.props.onPress());
    expect(props.onOpenPrivacy).toHaveBeenCalled();
    expect(props.onOpenSupport).toHaveBeenCalled();
  });

  it('offers account deletion in the app, not only by email', () => {
    // Play expects a deletion route that is not "write to us".
    const {tree, props} = render();
    const deleteRow = row(tree, copy.deleteAccount);
    expect(deleteRow).toBeDefined();
    ReactTestRenderer.act(() => deleteRow!.props.onPress());
    expect(props.onDeleteAccount).toHaveBeenCalled();
  });

  it('warns that deletion is permanent and does not stop billing', () => {
    // The store owns the subscription; deleting the account here cannot end
    // it, and an owner who assumes otherwise keeps being charged.
    expect(copy.deleteAccountBody).toMatch(/permanently/i);
    expect(copy.deleteAccountBody).toMatch(/cannot be undone/i);
    expect(copy.deleteAccountBody).toMatch(/App Store or Google Play/);
  });

  it('shows a chevron only on rows that lead somewhere', () => {
    const {tree} = render();
    for (const button of touchables(tree)) {
      if (textsOf(button).includes('›')) {
        expect(typeof button.props.onPress).toBe('function');
        expect(button.props.disabled).toBeFalsy();
      }
    }
  });

  it('disables the rows that have no destination yet', () => {
    const {tree} = render();
    expect(row(tree, copy.businessProfile)!.props.disabled).toBe(true);
  });
});
