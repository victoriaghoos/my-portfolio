import { act, fireEvent, render, screen } from '@testing-library/react';
import MusicPlayer from '../../src/components/MusicPlayer';

describe('MusicPlayer', () => {
  let play: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not start playing when the visitor clicks or types elsewhere on the page', () => {
    render(<MusicPlayer />);

    fireEvent.click(document.body);
    fireEvent.pointerDown(document.body);
    fireEvent.keyDown(document.body, { key: 'Enter' });

    expect(play).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Play background audio' })).toBeInTheDocument();
  });

  it('plays only when the pill is pressed, and pauses on the second press', async () => {
    render(<MusicPlayer />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Play background audio' }));
    });
    expect(play).toHaveBeenCalledTimes(1);

    const muteButton = screen.getByRole('button', { name: 'Mute background audio' });
    fireEvent.click(muteButton);
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Play background audio' })).toBeInTheDocument();
  });
});
