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

    await user.click(screen.getByRole('button', { name: /select language/i }));

    expect(screen.getByText('Nederlands')).toBeInTheDocument();
    expect(screen.getByText('Français')).toBeInTheDocument();
    expect(screen.getByText('日本語')).toBeInTheDocument();
  });

  it('switches the active language and closes the dropdown when an option is picked', async () => {
    const user = userEvent.setup();
    renderSelector();

    await user.click(screen.getByRole('button', { name: /select language/i }));
    await user.click(screen.getByText('Français'));

    expect(i18n.language).toBe('fr');
    expect(screen.getByText('FR')).toBeInTheDocument();
    expect(screen.queryByText('Nederlands')).not.toBeInTheDocument();
  });

  it('closes the dropdown when clicking outside of it', async () => {
    const user = userEvent.setup();
    renderSelector();

    await user.click(screen.getByRole('button', { name: /select language/i }));
    expect(screen.getByText('Nederlands')).toBeInTheDocument();

    await user.click(document.body);

    expect(screen.queryByText('Nederlands')).not.toBeInTheDocument();
  });
});
