import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ReminderDeleteButton from '../buttons/ReminderDeleteButton';

// Create a mock navigate function
const mockNavigate = vi.fn();

// Mock the react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

// Mock the ConfirmNotification component
vi.mock('../notifications/ConfirmNotification', () => ({
  default: ({ onConfirm, onCancel }) => (
    <div data-testid="confirm-notification">
      <button onClick={onConfirm} data-testid="confirm-button">Confirm</button>
      <button onClick={onCancel} data-testid="cancel-button">Cancel</button>
    </div>
  )
}));

describe('ReminderDeleteButton Component', () => {
  // Mock fetch globally
  global.fetch = vi.fn();
  
  // Mock localStorage
  const mockLocalStorage = {};
  const mockUserData = { id: 1, token: 'mock-token' };
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset fetch mock
    fetch.mockReset();
    mockNavigate.mockClear();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(key => {
          return key === 'user' ? JSON.stringify(mockUserData) : null;
        }),
        setItem: vi.fn((key, value) => {
          mockLocalStorage[key] = value;
        }),
        clear: vi.fn(() => {
          Object.keys(mockLocalStorage).forEach(key => {
            delete mockLocalStorage[key];
          });
        })
      },
      writable: true
    });
  });

  it('renders delete button with default className when not provided', () => {
    render(
      <ReminderDeleteButton 
        reminderId={1}
        refetch={vi.fn()}
        handleSuccess={vi.fn()}
      />
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn btn-danger');
    
    // Should contain a trash icon
    const trashIcon = document.querySelector('.bi-trash');
    expect(trashIcon).toBeInTheDocument();
  });

  it('renders delete button with custom className when provided', () => {
    render(
      <ReminderDeleteButton 
        reminderId={1}
        refetch={vi.fn()}
        handleSuccess={vi.fn()}
        className="custom-class"
      />
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('shows confirmation dialog when clicked', () => {
    render(
      <ReminderDeleteButton 
        reminderId={1}
        refetch={vi.fn()}
        handleSuccess={vi.fn()}
      />
    );
    
    // Notification should not be visible initially
    expect(screen.queryByTestId('confirm-notification')).not.toBeInTheDocument();
    
    // Click the delete button
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // Notification should be visible
    expect(screen.getByTestId('confirm-notification')).toBeInTheDocument();
  });

  it('calls API to delete reminder when confirmed', async () => {
    // Mock successful API response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });
    
    const mockRefetch = vi.fn();
    const mockHandleSuccess = vi.fn();
    
    render(
      <ReminderDeleteButton 
        reminderId={1}
        refetch={mockRefetch}
        handleSuccess={mockHandleSuccess}
      />
    );
    
    // Click delete button to show confirmation
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // Click confirm in the dialog
    const confirmButton = screen.getByTestId('confirm-button');
    fireEvent.click(confirmButton);
    
    // Wait for async operations
    await vi.waitFor(() => {
      // Check if fetch was called with correct parameters
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5169/1/rules/1',
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token'
          }
        }
      );
      
      // Refetch and success handler should be called
      expect(mockRefetch).toHaveBeenCalledTimes(1);
      expect(mockHandleSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('dismisses confirmation dialog when canceled', () => {
    render(
      <ReminderDeleteButton 
        reminderId={1}
        refetch={vi.fn()}
        handleSuccess={vi.fn()}
      />
    );
    
    // Click delete button to show confirmation
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // Confirmation should be visible
    expect(screen.getByTestId('confirm-notification')).toBeInTheDocument();
    
    // Click cancel in the dialog
    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.click(cancelButton);
    
    // Confirmation should be gone
    expect(screen.queryByTestId('confirm-notification')).not.toBeInTheDocument();
    
    // Fetch should not have been called
    expect(fetch).not.toHaveBeenCalled();
  });

  it('navigates to 404 page when API request fails', async () => {
    // Mock failed API response
    fetch.mockResolvedValueOnce({
      ok: false
    });
    
    render(
      <ReminderDeleteButton 
        reminderId={1}
        refetch={vi.fn()}
        handleSuccess={vi.fn()}
      />
    );
    
    // Click delete button to show confirmation
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // Click confirm in the dialog
    const confirmButton = screen.getByTestId('confirm-button');
    fireEvent.click(confirmButton);
    
    // Wait for async operations
    await vi.waitFor(() => {
      // Navigate should have been called with '/404'
      expect(mockNavigate).toHaveBeenCalledWith('/404');
    });
  });
}); 