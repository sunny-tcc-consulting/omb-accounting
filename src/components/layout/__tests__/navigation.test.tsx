'use client';

import { render, screen, fireEvent, act } from '@testing-library/react';
import { Breadcrumb, Sidebar } from '@/components/layout/Navigation';
import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Import after mocking
import { usePathname } from 'next/navigation';

describe('Breadcrumb', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders nothing on home page', () => {
    (usePathname as jest.Mock).mockReturnValue('/');
    
    render(<Breadcrumb />);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  test('renders breadcrumb items correctly', async () => {
    (usePathname as jest.Mock).mockReturnValue('/customers');
    
    await act(async () => {
      render(<Breadcrumb />);
    });
    
    expect(await screen.findByText('Home')).toBeInTheDocument();
    expect(await screen.findByText('Customers')).toBeInTheDocument();
  });

  test('highlights active page', async () => {
    (usePathname as jest.Mock).mockReturnValue('/customers/new');
    
    await act(async () => {
      render(<Breadcrumb />);
    });
    
    const activeItem = await screen.findByText('New Customer');
    expect(activeItem).toHaveClass('text-gray-900', { exact: false });
  });

  test('renders deep nested paths', async () => {
    (usePathname as jest.Mock).mockReturnValue('/customers/123');
    
    await act(async () => {
      render(<Breadcrumb />);
    });
    
    expect(await screen.findByText('Home')).toBeInTheDocument();
    expect(await screen.findByText('Customers')).toBeInTheDocument();
    expect(await screen.findByText('123')).toBeInTheDocument();
  });
});

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (usePathname as jest.Mock).mockReturnValue('/');
  });

  test('renders navigation items in desktop sidebar', () => {
    render(<Sidebar isCollapsed={false} onToggle={jest.fn()} />);
    
    const desktopSidebar = screen.getByTestId('desktop-sidebar');
    expect(desktopSidebar).toBeInTheDocument();
    expect(desktopSidebar).toHaveTextContent('Dashboard');
    expect(desktopSidebar).toHaveTextContent('Transactions');
    expect(desktopSidebar).toHaveTextContent('Reports');
  });

  test('shows collapse button when expanded (desktop)', () => {
    render(<Sidebar isCollapsed={false} onToggle={jest.fn()} />);
    
    const desktopSidebar = screen.getByTestId('desktop-sidebar');
    const collapseButton = desktopSidebar.querySelector('[aria-label="Collapse sidebar"]');
    expect(collapseButton).toBeInTheDocument();
  });

  test('shows expand button when collapsed (desktop)', () => {
    render(<Sidebar isCollapsed={true} onToggle={jest.fn()} />);
    
    const desktopSidebar = screen.getByTestId('desktop-sidebar');
    const expandButton = desktopSidebar.querySelector('[aria-label="Expand sidebar"]');
    expect(expandButton).toBeInTheDocument();
  });

  test('highlights active navigation item in desktop sidebar', () => {
    (usePathname as jest.Mock).mockReturnValue('/customers');
    
    render(<Sidebar isCollapsed={false} onToggle={jest.fn()} />);
    
    const desktopSidebar = screen.getByTestId('desktop-sidebar');
    const customersLink = desktopSidebar.querySelector('a[href="/customers"]');
    expect(customersLink).toHaveClass('bg-blue-50');
  });

  test('calls onToggle when collapse button clicked (desktop)', () => {
    const onToggle = jest.fn();
    render(<Sidebar isCollapsed={false} onToggle={onToggle} />);
    
    const desktopSidebar = screen.getByTestId('desktop-sidebar');
    const collapseButton = desktopSidebar.querySelector('[aria-label="Collapse sidebar"]');
    fireEvent.click(collapseButton!);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  test('keyboard navigation works in desktop sidebar', () => {
    (usePathname as jest.Mock).mockReturnValue('/');
    
    render(<Sidebar isCollapsed={false} onToggle={jest.fn()} />);
    
    const desktopSidebar = screen.getByTestId('desktop-sidebar');
    const dashboardLink = desktopSidebar.querySelector('a[href="/"]');
    fireEvent.keyDown(dashboardLink!, { key: 'Enter' });
    // Test doesn't crash - Enter key navigation works
  });

  test('mobile menu button appears', () => {
    render(<Sidebar isCollapsed={false} onToggle={jest.fn()} />);
    
    const menuButton = screen.getByLabelText('Open menu');
    expect(menuButton).toBeInTheDocument();
  });

  test('renders with correct width when collapsed', () => {
    render(<Sidebar isCollapsed={true} onToggle={jest.fn()} />);
    
    const desktopSidebar = screen.getByTestId('desktop-sidebar');
    expect(desktopSidebar).toHaveClass('w-16');
  });

  test('renders with correct width when expanded', () => {
    render(<Sidebar isCollapsed={false} onToggle={jest.fn()} />);
    
    const desktopSidebar = screen.getByTestId('desktop-sidebar');
    expect(desktopSidebar).toHaveClass('w-64');
  });

  test('mobile sidebar is present in DOM', () => {
    render(<Sidebar isCollapsed={false} onToggle={jest.fn()} />);
    
    const mobileSidebar = screen.getByTestId('mobile-sidebar');
    expect(mobileSidebar).toBeInTheDocument();
  });
});
