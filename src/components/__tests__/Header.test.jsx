import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../Header';

// Mock the react-router-dom's useLocation hook
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => ({ pathname: '/' })
  };
});

describe('Header Component', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders logo correctly', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    const logoImage = document.querySelector('img[alt="Logotipas"]');
    expect(logoImage).toBeInTheDocument();
  });

  it('shows profile button when user is logged in', () => {
    // Mock user data in localStorage
    localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Test User' }));
    
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Mano profilis')).toBeInTheDocument();
  });

  it('shows caretaker-specific buttons when caretaker is logged in', () => {
    // Mock caretaker data in localStorage
    localStorage.setItem('caretaker', JSON.stringify({ id: 2, name: 'Test Caretaker' }));
    
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Vartotojų sąrašas')).toBeInTheDocument();
  });

  it('toggles mobile menu when button is clicked', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500 // Mobile size
    });
    
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    // Get the menu toggle button
    const menuButton = document.querySelector('button[aria-label="Perjungti meniu"]');
    expect(menuButton).toBeInTheDocument();
    
    // Mobile menu should have buttons in the dropdown after click
    fireEvent.click(menuButton);
    
    // Verify the mobile menu is displayed after clicking
    const mobileMenu = document.querySelector('.d-md-none.mt-2');
    expect(mobileMenu).toBeInTheDocument();
    
    // Click again to close
    fireEvent.click(menuButton);
    
    // Menu should be closed
    expect(document.querySelector('.d-md-none.mt-2')).not.toBeInTheDocument();
  });

  it('handles logout correctly', () => {
    // Mock user data in localStorage
    localStorage.setItem('user', JSON.stringify({ id: 1 }));
    
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    // Click the logout button
    fireEvent.click(screen.getByText('Atsijungti'));
    
    // localStorage should be cleared
    expect(localStorage.getItem('user')).toBeNull();
  });
}); 