import { render, screen } from "@testing-library/react";
import {
  Toaster,
  CustomToast,
  NotificationCenter,
} from "@/components/ui/notification";

// Mock sonner at module level
jest.mock("sonner", () => ({
  Toaster: function MockToaster() {
    return <div data-testid="sonner-toaster" />;
  },
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    loading: jest.fn(),
    promise: jest.fn(),
    dismiss: jest.fn(),
  },
}));

describe("Notification Components", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Toaster", () => {
    it("renders without crashing", () => {
      render(<Toaster />);
      expect(screen.getByTestId("sonner-toaster")).toBeInTheDocument();
    });
  });

  describe("CustomToast", () => {
    it("renders with title", () => {
      render(<CustomToast title="Success" variant="success" />);

      expect(screen.getByText("Success")).toBeInTheDocument();
    });

    it("renders with title and description", () => {
      render(
        <CustomToast
          title="Success"
          description="Operation completed successfully"
          variant="success"
        />,
      );

      expect(screen.getByText("Success")).toBeInTheDocument();
      expect(
        screen.getByText("Operation completed successfully"),
      ).toBeInTheDocument();
    });

    it("renders action button when provided", () => {
      render(
        <CustomToast
          title="Update available"
          variant="info"
          action={{
            label: "Update",
            onClick: jest.fn(),
          }}
        />,
      );

      expect(screen.getByText("Update")).toBeInTheDocument();
    });
  });

  describe("NotificationCenter", () => {
    it("renders nothing when no notifications", () => {
      const { container } = render(<NotificationCenter notifications={[]} />);

      expect(container.querySelectorAll('[role="alert"]').length).toBe(0);
    });

    it("renders notifications when provided", () => {
      const notifications = [
        {
          id: "1",
          title: "Success",
          description: "Item created",
          variant: "success" as const,
        },
        {
          id: "2",
          title: "Error",
          description: "Failed to save",
          variant: "error" as const,
        },
      ];

      render(<NotificationCenter notifications={notifications} />);

      expect(screen.getByText("Success")).toBeInTheDocument();
      expect(screen.getByText("Error")).toBeInTheDocument();
    });

    it("renders high priority notification", () => {
      const notifications = [
        {
          id: "1",
          title: "Urgent",
          description: "Requires attention",
          variant: "warning" as const,
          priority: "high" as const,
        },
      ];

      render(<NotificationCenter notifications={notifications} />);

      expect(screen.getByText("Urgent")).toBeInTheDocument();
    });
  });
});
