import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { afterEach, describe, expect, it } from 'vitest';
import i18n from '../../src/i18n';
import LanguageSelector from '../../src/components/LanguageSelector';

const renderSelector = () =>
  render(
    <I18nextProvider i18n={i18n}>
      <LanguageSelector />
    </I18nextProvider>,
  );

describe('LanguageSelector', () => {
  afterEach(async () => {
    cleanup();
    await i18n.changeLanguage('en');
  });

  it('shows the active language and keeps the dropdown closed by default', () => {
    renderSelector();
    expect(screen.getByText('EN')).toBeInTheDocument();
    expect(screen.queryByText('Nederlands')).not.toBeInTheDocument();
  });

  it('opens the dropdown with every supported language on click', async () => {
    const user = userEvent.setup();
    renderSelector();

    await user.click(screen.getByRole('button', { name: /language: en/i }));

    expect(screen.getByText('Nederlands')).toBeInTheDocument();
    expect(screen.getByText('Français')).toBeInTheDocument();
    expect(screen.getByText('日本語')).toBeInTheDocument();
  });

  it('switches the active language and closes the dropdown when an option is picked', async () => {
    const user = userEvent.setup();
    renderSelector();

    await user.click(screen.getByRole('button', { name: /language: en/i }));
    await user.click(screen.getByText('Français'));

    expect(i18n.language).toBe('fr');
    expect(screen.getByText('FR')).toBeInTheDocument();
    expect(screen.queryByText('Nederlands')).not.toBeInTheDocument();
  });

  it('names the button with the visible language code and reports whether it is open', async () => {
    const user = userEvent.setup();
    renderSelector();

    const button = screen.getByRole('button', { name: 'Language: EN' });
    expect(button).toHaveAttribute('aria-expanded', 'false');

    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Nederlands')).toHaveAttribute('lang', 'nl');
    expect(screen.getByText('English')).toHaveAttribute('aria-current', 'true');
  });

  it('closes the dropdown with Escape and puts the focus back on the button', async () => {
    const user = userEvent.setup();
    renderSelector();

    const button = screen.getByRole('button', { name: 'Language: EN' });
    await user.click(button);
    await user.keyboard('{Escape}');

    expect(screen.queryByText('Nederlands')).not.toBeInTheDocument();
    expect(button).toHaveFocus();
  });

  it('keeps the page language (html lang) in sync with the chosen language', async () => {
    const user = userEvent.setup();
    renderSelector();

    await user.click(screen.getByRole('button', { name: 'Language: EN' }));
    await user.click(screen.getByText('日本語'));

    expect(document.documentElement.lang).toBe('ja');
  });

  it('closes the dropdown when clicking outside of it', async () => {
    const user = userEvent.setup();
    renderSelector();

    await user.click(screen.getByRole('button', { name: /language: en/i }));
    expect(screen.getByText('Nederlands')).toBeInTheDocument();

    await user.click(document.body);

    expect(screen.queryByText('Nederlands')).not.toBeInTheDocument();
  });
});
