import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import UsersList from '../UsersList';

// Mock the ConfirmNotification component
vi.mock('../notifications/ConfirmNotification', () => ({
  default: ({ onConfirm, onCancel }) => (
    <div data-testid="confirm-notification">
      <button onClick={onConfirm} data-testid="confirm-button">Confirm</button>
      <button onClick={onCancel} data-testid="cancel-button">Cancel</button>
    </div>
  )
}));

describe('UsersList Component', () => {
  const mockUsers = [
    {
      id: 1,
      name: 'John',
      surname: 'Doe',
      email: 'john@example.com',
      date_of_birth: '1990-01-01',
      confirmed: 1
    },
    {
      id: 2,
      name: 'Jane',
      surname: 'Smith',
      email: 'jane@example.com',
      date_of_birth: '1995-05-15',
      confirmed: 0
    }
  ];

  const mockOnUserClick = vi.fn();
  const mockOnUnlink = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset innerWidth for each test
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024 // Default to desktop view
    });
  });

  it('renders a message when no users are provided', () => {
    render(<UsersList onUserClick={mockOnUserClick} onUnlink={mockOnUnlink} />);
    expect(screen.getByText('Pridėkite vartotoją.')).toBeInTheDocument();
  });

  it('renders users in mobile view correctly', () => {
    // Set to mobile view
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500
    });

    render(
      <UsersList 
        users={mockUsers}
        onUserClick={mockOnUserClick}
        onUnlink={mockOnUnlink}
      />
    );

    // Check if header is present
    expect(screen.getByText('Prijungtų vartotojų sąrašas:')).toBeInTheDocument();
    
    // Check if user names are displayed - looking for h5 elements with user names
    const johnDoeElements = screen.getAllByText(/John/);
    const janeSmithElements = screen.getAllByText(/Jane/);
    expect(johnDoeElements.length).toBeGreaterThan(0);
    expect(janeSmithElements.length).toBeGreaterThan(0);
    
    // Check if confirmed status icons are displayed for each user
    const successIcons = document.querySelectorAll('.bi-check-circle-fill');
    const errorIcons = document.querySelectorAll('.bi-x-circle-fill');
    expect(successIcons.length).toBeGreaterThan(0);
    expect(errorIcons.length).toBeGreaterThan(0);
  });

  it('renders users in desktop view correctly', () => {
    render(
      <UsersList 
        users={mockUsers}
        onUserClick={mockOnUserClick}
        onUnlink={mockOnUnlink}
      />
    );

    // Check table headers
    expect(screen.getByText('Nr.')).toBeInTheDocument();
    expect(screen.getByText('Prijungtas vartotojas')).toBeInTheDocument();
    expect(screen.getByText('Patvirtintas?')).toBeInTheDocument();
    
    // Use getAllByText for the header that appears multiple times
    const deleteHeaders = screen.getAllByText('Atjungti vartotoją');
    expect(deleteHeaders.length).toBeGreaterThan(0);
    
    // Check if user names are displayed
    const johnElements = screen.getAllByText(/John/);
    const janeElements = screen.getAllByText(/Jane/);
    expect(johnElements.length).toBeGreaterThan(0);
    expect(janeElements.length).toBeGreaterThan(0);
  });

  it('calls onUserClick when clicking on a user in desktop view', () => {
    render(
      <UsersList 
        users={mockUsers}
        onUserClick={mockOnUserClick}
        onUnlink={mockOnUnlink}
      />
    );

    // Find the clickable user cell using CSS class
    const userCells = document.querySelectorAll('.connected-user-cell');
    fireEvent.click(userCells[0]);
    
    // Check that onUserClick was called with correct ID and confirmed status
    expect(mockOnUserClick).toHaveBeenCalledWith(1, 1);
  });

  it('shows confirmation dialog when delete button is clicked', () => {
    render(
      <UsersList 
        users={mockUsers}
        onUserClick={mockOnUserClick}
        onUnlink={mockOnUnlink}
      />
    );

    // Find delete buttons
    const deleteButtons = screen.getAllByTitle('Atjungti vartotoją');
    
    // Click the first delete button
    fireEvent.click(deleteButtons[0]);
    
    // Confirm notification should be visible now
    expect(screen.getByTestId('confirm-notification')).toBeInTheDocument();
  });

  it('calls onUnlink when confirmation is approved', () => {
    render(
      <UsersList 
        users={mockUsers}
        onUserClick={mockOnUserClick}
        onUnlink={mockOnUnlink}
      />
    );

    // Click delete button for first user
    const deleteButtons = screen.getAllByTitle('Atjungti vartotoją');
    fireEvent.click(deleteButtons[0]);
    
    // Click confirm button in the notification
    const confirmButton = screen.getByTestId('confirm-button');
    fireEvent.click(confirmButton);
    
    // Check if onUnlink was called with correct user ID
    expect(mockOnUnlink).toHaveBeenCalledWith(1);
  });

  it('dismisses confirmation dialog when canceled', () => {
    render(
      <UsersList 
        users={mockUsers}
        onUserClick={mockOnUserClick}
        onUnlink={mockOnUnlink}
      />
    );

    // Click delete button
    const deleteButtons = screen.getAllByTitle('Atjungti vartotoją');
    fireEvent.click(deleteButtons[0]);
    
    // Notification should be visible
    expect(screen.getByTestId('confirm-notification')).toBeInTheDocument();
    
    // Click cancel button
    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.click(cancelButton);
    
    // Notification should be gone
    expect(screen.queryByTestId('confirm-notification')).not.toBeInTheDocument();
    
    // onUnlink should not have been called
    expect(mockOnUnlink).not.toHaveBeenCalled();
  });
}); 