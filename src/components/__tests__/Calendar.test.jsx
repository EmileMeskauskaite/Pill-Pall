import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Calendar from '../Calendar';

// Mock the ReminderButton component
vi.mock('../buttons/ReminderButton', () => ({
  default: ({ reminder, refetch }) => (
    <button data-testid={`reminder-button-${reminder.id}`}>
      {reminder.medicine_name || 'Reminder'}
    </button>
  )
}));

describe('Calendar Component', () => {
  const mockRefetch = vi.fn();
  
  // Create a fixed date for today to make tests consistent
  const today = new Date('2023-06-15');
  
  // Setup a mock date range for the week
  const mockDateRange = {
    start: new Date('2023-06-12'),  // Monday
    end: new Date('2023-06-18')     // Sunday
  };

  // Mock reminders data
  const mockReminders = [
    {
      id: 1,
      reminder_date: '2023-06-12',  // Monday
      medicine_name: 'Medicine A',
      reminder_time: '08:00:00'
    },
    {
      id: 2,
      reminder_date: '2023-06-15',  // Thursday (today)
      medicine_name: 'Medicine B',
      reminder_time: '12:30:00'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock Date.now to return our fixed date
    const originalDate = global.Date;
    global.Date = class extends originalDate {
      constructor(...args) {
        if (args.length === 0) {
          return new originalDate(today);
        }
        return new originalDate(...args);
      }
      
      static now() {
        return new originalDate(today).getTime();
      }
    };
  });

  afterEach(() => {
    // Restore original Date
    global.Date = Date;
  });

  it('renders loading message when no date range is provided', () => {
    render(<Calendar reminders={mockReminders} refetch={mockRefetch} />);
    expect(screen.getByText('Kraunamas kalendorius...')).toBeInTheDocument();
  });

  it('renders loading message when no reminders are provided', () => {
    render(<Calendar dateRange={mockDateRange} refetch={mockRefetch} />);
    expect(screen.getByText('Kraunamas kalendorius...')).toBeInTheDocument();
  });

  it('renders all 7 days of the week', () => {
    render(
      <Calendar 
        dateRange={mockDateRange} 
        reminders={mockReminders} 
        refetch={mockRefetch} 
      />
    );
    
    // Check if all days of the week are rendered
    expect(screen.getByText(/Pirmadienis/)).toBeInTheDocument();
    expect(screen.getByText(/Antradienis/)).toBeInTheDocument();
    expect(screen.getByText(/Trečiadienis/)).toBeInTheDocument();
    expect(screen.getByText(/Ketvirtadienis/)).toBeInTheDocument();
    expect(screen.getByText(/Penktadienis/)).toBeInTheDocument();
    expect(screen.getByText(/Šeštadienis/)).toBeInTheDocument();
    expect(screen.getByText(/Sekmadienis/)).toBeInTheDocument();
  });

  it('highlights today with "(Šiandien)" text', () => {
    render(
      <Calendar 
        dateRange={mockDateRange} 
        reminders={mockReminders} 
        refetch={mockRefetch} 
      />
    );
    
    expect(screen.getByText(/\(Šiandien\)/)).toBeInTheDocument();
    // Make sure it's on Thursday
    expect(screen.getByText(/Ketvirtadienis.*\(Šiandien\)/)).toBeInTheDocument();
  });

  it('renders reminders for the correct days', () => {
    render(
      <Calendar 
        dateRange={mockDateRange} 
        reminders={mockReminders} 
        refetch={mockRefetch} 
      />
    );
    
    // Check if the reminder buttons are rendered
    expect(screen.getByTestId('reminder-button-1')).toBeInTheDocument();
    expect(screen.getByTestId('reminder-button-2')).toBeInTheDocument();
  });

  it('shows "Nėra priminimų" for days without reminders', () => {
    render(
      <Calendar 
        dateRange={mockDateRange} 
        reminders={mockReminders} 
        refetch={mockRefetch} 
      />
    );
    
    // We should have 5 days without reminders (we have reminders only on Monday and Thursday)
    // So we should have 5 instances of "Nėra priminimų"
    const emptyDayMessages = screen.getAllByText('Nėra priminimų');
    expect(emptyDayMessages.length).toBe(5);
  });
}); 