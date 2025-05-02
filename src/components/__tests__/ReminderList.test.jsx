import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ReminderList from '../ReminderList';

// Mock the ReminderDeleteButton component
vi.mock('../buttons/ReminderDeleteButton', () => ({
  default: ({ reminderId, handleSuccess, className }) => (
    <button 
      data-testid={`delete-button-${reminderId}`}
      onClick={() => handleSuccess && handleSuccess()}
      className={className}
    >
      Delete
    </button>
  )
}));

describe('ReminderList Component', () => {
  const mockReminders = [
    {
      id: 1,
      reminder_minutes_before: 30,
      start_date: '2023-05-01',
      end_date: '2023-06-01',
      reminder_time: '08:00:00',
      week_days: [1, 2, 3],
    },
    {
      id: 2,
      reminder_minutes_before: 15,
      start_date: '2023-05-15',
      end_date: '2023-05-30',
      reminder_time: '12:30:00',
      week_days: [0, 4, 6],
    },
  ];

  const mockRefetch = vi.fn();
  const mockOnSuccessChange = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnReminder = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the correct number of reminders', () => {
    render(
      <ReminderList
        reminders={mockReminders}
        refetch={mockRefetch}
        onSuccessChange={mockOnSuccessChange}
        onEdit={mockOnEdit}
        onReminder={mockOnReminder}
      />
    );

    // Check if it renders both reminders
    expect(screen.getAllByText(/Priminimas #[1-2]/i).length).toBe(2);
  });

  it('formats dates correctly', () => {
    render(
      <ReminderList
        reminders={mockReminders}
        refetch={mockRefetch}
        onSuccessChange={mockOnSuccessChange}
        onEdit={mockOnEdit}
        onReminder={mockOnReminder}
      />
    );

    // Check first reminder dates
    expect(screen.getAllByText('01/05/2023').length).toBeGreaterThan(0);
    expect(screen.getAllByText('01/06/2023').length).toBeGreaterThan(0);
  });

  it('formats weekdays correctly', () => {
    render(
      <ReminderList
        reminders={mockReminders}
        refetch={mockRefetch}
        onSuccessChange={mockOnSuccessChange}
        onEdit={mockOnEdit}
        onReminder={mockOnReminder}
      />
    );

    // Check if weekdays are formatted correctly
    expect(screen.getAllByText('Pirmadienis, Antradienis, Trečiadienis').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Sekmadienis, Ketvirtadienis, Šeštadienis').length).toBeGreaterThan(0);
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <ReminderList
        reminders={mockReminders}
        refetch={mockRefetch}
        onSuccessChange={mockOnSuccessChange}
        onEdit={mockOnEdit}
        onReminder={mockOnReminder}
      />
    );

    // Find edit buttons (could be multiple due to responsive design)
    const editButtons = screen.getAllByTitle('Redaguoti');
    fireEvent.click(editButtons[0]);

    // Check if onEdit was called with the correct reminder
    expect(mockOnEdit).toHaveBeenCalledWith(mockReminders[0]);
  });

  it('renders delete buttons for each reminder', () => {
    render(
      <ReminderList
        reminders={mockReminders}
        refetch={mockRefetch}
        onSuccessChange={mockOnSuccessChange}
        onEdit={mockOnEdit}
        onReminder={mockOnReminder}
      />
    );

    // Check if delete buttons are rendered - using getAllByTestId instead of getByTestId
    const deleteButton1Elements = screen.getAllByTestId('delete-button-1');
    const deleteButton2Elements = screen.getAllByTestId('delete-button-2');
    
    expect(deleteButton1Elements.length).toBeGreaterThan(0);
    expect(deleteButton2Elements.length).toBeGreaterThan(0);
  });
}); 