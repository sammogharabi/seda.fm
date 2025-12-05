import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PickGenres } from './PickGenres';
import { toast } from 'sonner';

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
  },
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

describe('PickGenres', () => {
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the genres selection interface', () => {
    render(<PickGenres onComplete={mockOnComplete} />);

    expect(screen.getByText('Pick Your Genres')).toBeInTheDocument();
    expect(screen.getByText('Choose the music genres you love most. This helps us personalize your experience.')).toBeInTheDocument();
    expect(screen.getByText('Electronic')).toBeInTheDocument();
    expect(screen.getByText('Hip-Hop')).toBeInTheDocument();
    expect(screen.getByText('Jazz')).toBeInTheDocument();
  });

  it('allows selecting and deselecting genres', () => {
    render(<PickGenres onComplete={mockOnComplete} />);

    const electronicButton = screen.getByText('Electronic');
    const hipHopButton = screen.getByText('Hip-Hop');

    // Select genres
    fireEvent.click(electronicButton);
    fireEvent.click(hipHopButton);

    expect(screen.getByText('Selected: 2 / 10')).toBeInTheDocument();

    // Deselect a genre
    fireEvent.click(electronicButton);
    expect(screen.getByText('Selected: 1 / 10')).toBeInTheDocument();
  });

  it('prevents selecting more than 10 genres', () => {
    render(<PickGenres onComplete={mockOnComplete} />);

    // Try to select 11 genres
    const genreButtons = screen.getAllByRole('button').filter(btn =>
      btn.textContent && !btn.textContent.includes('Continue')
    );

    // Select first 10 genres
    for (let i = 0; i < 10; i++) {
      fireEvent.click(genreButtons[i]);
    }

    expect(screen.getByText('Selected: 10 / 10')).toBeInTheDocument();

    // Try to select 11th genre
    fireEvent.click(genreButtons[10]);

    expect(toast.error).toHaveBeenCalledWith('You can select up to 10 genres');
    expect(screen.getByText('Selected: 10 / 10')).toBeInTheDocument();
  });

  it('shows error when trying to submit without selecting genres', () => {
    render(<PickGenres onComplete={mockOnComplete} />);

    const continueButton = screen.getByText('Continue to sedā.fm');
    fireEvent.click(continueButton);

    expect(toast.error).toHaveBeenCalledWith('Please select at least one genre');
    expect(mockOnComplete).not.toHaveBeenCalled();
  });

  it('calls onComplete with selected genres when submitted', async () => {
    mockOnComplete.mockResolvedValue(undefined);

    render(<PickGenres onComplete={mockOnComplete} />);

    // Select some genres
    fireEvent.click(screen.getByText('Electronic'));
    fireEvent.click(screen.getByText('Hip-Hop'));
    fireEvent.click(screen.getByText('Jazz'));

    // Submit
    const continueButton = screen.getByText('Continue to sedā.fm');
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith(['Electronic', 'Hip-Hop', 'Jazz']);
    });
  });

  it('handles submission errors gracefully', async () => {
    const mockError = new Error('Network error');
    mockOnComplete.mockRejectedValue(mockError);

    render(<PickGenres onComplete={mockOnComplete} />);

    // Select a genre and submit
    fireEvent.click(screen.getByText('Electronic'));
    fireEvent.click(screen.getByText('Continue to sedā.fm'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to save genres. Please try again.');
    });
  });

  it('disables interactions when loading', () => {
    render(<PickGenres onComplete={mockOnComplete} isLoading={true} />);

    const electronicButton = screen.getByText('Electronic');
    const continueButton = screen.getByText('Continue to sedā.fm');

    expect(electronicButton.closest('button')).toHaveClass('opacity-50', 'cursor-not-allowed');
    expect(continueButton).toBeDisabled();
  });

  it('shows loading state during submission', async () => {
    mockOnComplete.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<PickGenres onComplete={mockOnComplete} />);

    fireEvent.click(screen.getByText('Electronic'));
    fireEvent.click(screen.getByText('Continue to sedā.fm'));

    expect(screen.getByText('Saving...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Continue to sedā.fm')).toBeInTheDocument();
    });
  });
});