import { act, fireEvent, render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../src/i18n';
import MusicPlayer from '../../src/components/MusicPlayer';

const renderPlayer = () =>
  render(
    <I18nextProvider i18n={i18n}>
      <MusicPlayer />
    </I18nextProvider>,
  );

// The accessible name starts with the visible status text (WCAG 2.5.3)
const PLAY_NAME = 'Audio muted: play background music';
const MUTE_NAME = 'Lo-fi: mute background music';

describe('MusicPlayer', () => {
  let play: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    await i18n.changeLanguage('en');
    play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not start playing when the visitor clicks or types elsewhere on the page', () => {
    renderPlayer();

    fireEvent.click(document.body);
    fireEvent.pointerDown(document.body);
    fireEvent.keyDown(document.body, { key: 'Enter' });

    expect(play).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: PLAY_NAME })).toBeInTheDocument();
  });

  it('plays only when the pill is pressed, and pauses on the second press', async () => {
    renderPlayer();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: PLAY_NAME }));
    });
    expect(play).toHaveBeenCalledTimes(1);

    const muteButton = screen.getByRole('button', { name: MUTE_NAME });
    fireEvent.click(muteButton);
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: PLAY_NAME })).toBeInTheDocument();
  });
});
