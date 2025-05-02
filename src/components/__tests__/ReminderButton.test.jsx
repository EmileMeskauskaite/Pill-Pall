import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ReminderButton from '../buttons/ReminderButton';

// Mock the ReminderModal component
vi.mock('../forms/ReminderModal', () => ({
  default: ({ reminder, onClose, refetch }) => (
    <div data-testid="reminder-modal">
      <button onClick={onClose} data-testid="close-button">Close</button>
    </div>
  )
}));

describe('ReminderButton Component', () => {
  // Mock localStorage
  const mockLocalStorage = {};
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(key => {
          return key === 'user' ? JSON.stringify({ id: 1 }) : null;
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

  it('renders with medicine name and time', () => {
    const mockReminder = {
      id: 1,
      medicine_name: 'Paracetamol',
      reminder_time: '08:00:00',
      reminder_date: new Date().toISOString().split('T')[0], // Today
      taken: false
    };
    
    const mockRefetch = vi.fn();
    
    render(<ReminderButton reminder={mockReminder} refetch={mockRefetch} />);
    
    // Check if medicine name is displayed
    expect(screen.getByText('Paracetamol')).toBeInTheDocument();
    
    // Check if time is formatted and displayed
    expect(screen.getByText('08:00')).toBeInTheDocument();
  });

  it('applies correct styling for a taken reminder', () => {
    const mockReminder = {
      id: 1,
      medicine_name: 'Paracetamol',
      reminder_time: '08:00:00',
      reminder_date: new Date().toISOString().split('T')[0], // Today
      taken: true
    };
    
    render(<ReminderButton reminder={mockReminder} refetch={vi.fn()} />);
    
    // Success styling should be applied for taken reminders
    const button = screen.getByText('Paracetamol').closest('button');
    expect(button).toHaveClass('btn-success');
  });

  it('applies correct styling for a past and untaken reminder', () => {
    // Create a date for yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const mockReminder = {
      id: 1,
      medicine_name: 'Paracetamol',
      reminder_time: '08:00:00',
      reminder_date: yesterday.toISOString().split('T')[0], // Yesterday
      taken: false
    };
    
    render(<ReminderButton reminder={mockReminder} refetch={vi.fn()} />);
    
    // Danger styling should be applied for past untaken reminders
    const button = screen.getByText('Paracetamol').closest('button');
    expect(button).toHaveClass('btn-danger');
  });

  it('applies correct styling for a future reminder', () => {
    // Create a date for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const mockReminder = {
      id: 1,
      medicine_name: 'Paracetamol',
      reminder_time: '08:00:00',
      reminder_date: tomorrow.toISOString().split('T')[0], // Tomorrow
      taken: false
    };
    
    render(<ReminderButton reminder={mockReminder} refetch={vi.fn()} />);
    
    // Outline styling should be applied for future reminders
    const button = screen.getByText('Paracetamol').closest('button');
    expect(button).toHaveClass('btn-outline-secondary');
  });

  it('opens modal when clicked', () => {
    const mockReminder = {
      id: 1,
      medicine_name: 'Paracetamol',
      reminder_time: '08:00:00',
      reminder_date: new Date().toISOString().split('T')[0], // Today
      taken: false
    };
    
    render(<ReminderButton reminder={mockReminder} refetch={vi.fn()} />);
    
    // Modal should not be visible initially
    expect(screen.queryByTestId('reminder-modal')).not.toBeInTheDocument();
    
    // Click the reminder button
    const button = screen.getByText('Paracetamol').closest('button');
    fireEvent.click(button);
    
    // Modal should be visible now
    expect(screen.getByTestId('reminder-modal')).toBeInTheDocument();
  });

  it('closes modal when close button is clicked', () => {
    const mockReminder = {
      id: 1,
      medicine_name: 'Paracetamol',
      reminder_time: '08:00:00',
      reminder_date: new Date().toISOString().split('T')[0], // Today
      taken: false
    };
    
    render(<ReminderButton reminder={mockReminder} refetch={vi.fn()} />);
    
    // Click the reminder button to open modal
    const button = screen.getByText('Paracetamol').closest('button');
    fireEvent.click(button);
    
    // Modal should be visible
    expect(screen.getByTestId('reminder-modal')).toBeInTheDocument();
    
    // Click the close button
    const closeButton = screen.getByTestId('close-button');
    fireEvent.click(closeButton);
    
    // Modal should be gone
    expect(screen.queryByTestId('reminder-modal')).not.toBeInTheDocument();
  });
}); 