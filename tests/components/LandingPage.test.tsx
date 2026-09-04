import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LandingPage from '../../src/components/LandingPage';

const renderLandingPage = () =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<div>Home page</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe('LandingPage (reduced motion)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.matchMedia = () =>
      ({
        matches: true,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList;
    sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('reveals the skip button after the initial delay', () => {
    renderLandingPage();
    expect(screen.queryByText('Skip Intro')).not.toHaveClass('is-visible');

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByText('Skip Intro')).toHaveClass('is-visible');
  });

  it('navigates to /home after the reduced-motion auto-exit delay', () => {
    renderLandingPage();

    act(() => {
      vi.advanceTimersByTime(2500);
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText('Home page')).toBeInTheDocument();
    expect(sessionStorage.getItem('intro-seen')).toBe('1');
  });

  it('skips straight to /home on Escape without waiting for the auto-exit timer', () => {
    renderLandingPage();

    act(() => {
      fireEvent.keyDown(window, { key: 'Escape' });
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText('Home page')).toBeInTheDocument();
  });

  it('skips the intro entirely on repeat visits', () => {
    sessionStorage.setItem('intro-seen', '1');
    renderLandingPage();

    expect(screen.getByText('Home page')).toBeInTheDocument();
  });
});
