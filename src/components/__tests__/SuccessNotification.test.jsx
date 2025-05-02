import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import SuccessNotification from '../notifications/SuccessNotification';

describe('SuccessNotification Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders with default message when no custom message is provided', () => {
    render(<SuccessNotification />);
    
    expect(screen.getByText('✅ Pakeitimai sėkmingai išsaugoti!')).toBeInTheDocument();
  });

  it('renders with the provided custom message', () => {
    render(<SuccessNotification customMessage="Operation successful!" />);
    
    expect(screen.getByText('Operation successful!')).toBeInTheDocument();
  });

  it('is visible initially and disappears after timeout', () => {
    render(<SuccessNotification />);
    
    // Check that notification is initially visible
    expect(screen.getByText('✅ Pakeitimai sėkmingai išsaugoti!')).toBeInTheDocument();
    
    // Fast-forward time past the timeout
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    // Check that the component is no longer in the document
    expect(screen.queryByText('✅ Pakeitimai sėkmingai išsaugoti!')).not.toBeInTheDocument();
  });

  it('clears timeout on unmount', () => {
    // Mock clearTimeout
    const originalClearTimeout = window.clearTimeout;
    const mockClearTimeout = vi.fn();
    window.clearTimeout = mockClearTimeout;
    
    const { unmount } = render(<SuccessNotification />);
    
    // Unmount the component
    unmount();
    
    // Check that clearTimeout was called
    expect(mockClearTimeout).toHaveBeenCalled();
    
    // Restore original clearTimeout
    window.clearTimeout = originalClearTimeout;
  });
}); 