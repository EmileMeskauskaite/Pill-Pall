import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MedicineList from '../MedicineList';

// Mock the MedicineDeleteButton component
vi.mock('../buttons/MedicineDeleteButton', () => ({
  default: ({ medicineId, handleSuccess, className }) => (
    <button 
      data-testid={`delete-button-${medicineId}`}
      onClick={() => handleSuccess && handleSuccess()}
      className={className}
    >
      Delete
    </button>
  )
}));

describe('MedicineList Component', () => {
  const mockMedicines = [
    {
      id: 1,
      medicine_name: 'Paracetamol',
      strength: '500mg',
      amount: '30 tablets',
      notes: 'Take with food'
    },
    {
      id: 2,
      medicine_name: 'Ibuprofen',
      strength: '400mg',
      amount: '20 tablets',
      notes: null
    }
  ];

  const mockRefetch = vi.fn();
  const mockOnSuccessChange = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnReminder = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders medicine information correctly in mobile view', () => {
    // Mock window innerWidth for mobile view
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500
    });

    render(
      <MedicineList
        medicines={mockMedicines}
        refetch={mockRefetch}
        onSuccessChange={mockOnSuccessChange}
        onEdit={mockOnEdit}
        onReminder={mockOnReminder}
      />
    );

    // Check if both medicines are rendered
    expect(screen.getAllByText('Paracetamol')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Ibuprofen')[0]).toBeInTheDocument();
    
    // Check if strength information is displayed
    expect(screen.getAllByText('Stiprumas:')[0]).toBeInTheDocument();
    expect(screen.getAllByText('500mg')[0]).toBeInTheDocument();
    expect(screen.getAllByText('400mg')[0]).toBeInTheDocument();
    
    // Check if amount information is displayed
    expect(screen.getAllByText('Kiekis:')[0]).toBeInTheDocument();
    expect(screen.getAllByText('30 tablets')[0]).toBeInTheDocument();
    expect(screen.getAllByText('20 tablets')[0]).toBeInTheDocument();
    
    // Check if notes are displayed for the medicine that has them
    expect(screen.getAllByText('Pastabos:')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Take with food')[0]).toBeInTheDocument();
  });

  it('renders medicine information correctly in desktop view', () => {
    // Mock window innerWidth for desktop view
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200
    });

    render(
      <MedicineList
        medicines={mockMedicines}
        refetch={mockRefetch}
        onSuccessChange={mockOnSuccessChange}
        onEdit={mockOnEdit}
        onReminder={mockOnReminder}
      />
    );

    // Check column headers
    expect(screen.getAllByText('Nr.')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Vaisto pavadinimas')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Stiprumas')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Kiekis')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Pastabos')[0]).toBeInTheDocument();
    
    // Check if both medicines are rendered
    expect(screen.getAllByText('Paracetamol')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Ibuprofen')[0]).toBeInTheDocument();
  });

  it('calls onReminder when reminder button is clicked', () => {
    render(
      <MedicineList
        medicines={mockMedicines}
        refetch={mockRefetch}
        onSuccessChange={mockOnSuccessChange}
        onEdit={mockOnEdit}
        onReminder={mockOnReminder}
      />
    );

    // Find reminder buttons (denoted by the ⏰ emoji)
    const reminderButtons = screen.getAllByTitle('Nustatyti priminimą');
    
    // Click the first reminder button
    fireEvent.click(reminderButtons[0]);
    
    // Check if onReminder was called with correct medicine ID
    expect(mockOnReminder).toHaveBeenCalledWith(1);
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <MedicineList
        medicines={mockMedicines}
        refetch={mockRefetch}
        onSuccessChange={mockOnSuccessChange}
        onEdit={mockOnEdit}
        onReminder={mockOnReminder}
      />
    );

    // Find edit buttons
    const editButtons = screen.getAllByTitle('Redaguoti');
    
    // Click the first edit button
    fireEvent.click(editButtons[0]);
    
    // Check if onEdit was called with correct medicine object
    expect(mockOnEdit).toHaveBeenCalledWith(mockMedicines[0]);
  });

  it('renders delete buttons for each medicine', () => {
    render(
      <MedicineList
        medicines={mockMedicines}
        refetch={mockRefetch}
        onSuccessChange={mockOnSuccessChange}
        onEdit={mockOnEdit}
        onReminder={mockOnReminder}
      />
    );

    // Check if delete buttons are rendered
    expect(screen.getAllByTestId('delete-button-1').length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('delete-button-2').length).toBeGreaterThan(0);
  });
}); 