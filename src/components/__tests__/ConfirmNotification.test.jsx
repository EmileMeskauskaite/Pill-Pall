import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmNotification from '../notifications/ConfirmNotification';

describe('ConfirmNotification Component', () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default message when no custom message is provided', () => {
    render(
      <ConfirmNotification 
        onConfirm={mockOnConfirm} 
        onCancel={mockOnCancel} 
      />
    );
    
    expect(screen.getByText('⚠️ Ar tikrai norite ištrinti šį elementą?')).toBeInTheDocument();
  });

  it('renders with the provided custom message', () => {
    render(
      <ConfirmNotification 
        onConfirm={mockOnConfirm} 
        onCancel={mockOnCancel} 
        customMessage="Are you sure you want to proceed?"
      />
    );
    
    expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
  });

  it('displays confirm and cancel buttons', () => {
    render(
      <ConfirmNotification 
        onConfirm={mockOnConfirm} 
        onCancel={mockOnCancel} 
      />
    );
    
    expect(screen.getByText('Taip')).toBeInTheDocument();
    expect(screen.getByText('Atšaukti')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    render(
      <ConfirmNotification 
        onConfirm={mockOnConfirm} 
        onCancel={mockOnCancel} 
      />
    );
    
    const confirmButton = screen.getByText('Taip');
    fireEvent.click(confirmButton);
    
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <ConfirmNotification 
        onConfirm={mockOnConfirm} 
        onCancel={mockOnCancel} 
      />
    );
    
    const cancelButton = screen.getByText('Atšaukti');
    fireEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });
}); 