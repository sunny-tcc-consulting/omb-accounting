import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  EmptyState,
  SearchEmptyState,
  DataEmptyState,
  CreateEmptyState,
  ErrorEmptyState,
  UnauthorizedEmptyState,
} from "@/components/ui/empty-state";

describe("EmptyState Components", () => {
  describe("EmptyState", () => {
    it("renders with default title", () => {
      render(<EmptyState />);
      expect(screen.getByText("Nothing here yet")).toBeInTheDocument();
    });

    it("renders with custom title and description", () => {
      render(
        <EmptyState
          title="No customers"
          description="Create your first customer"
        />,
      );

      expect(screen.getByText("No customers")).toBeInTheDocument();
      expect(
        screen.getByText("Create your first customer"),
      ).toBeInTheDocument();
    });

    it("renders action button when provided", async () => {
      const onClick = jest.fn();
      render(
        <EmptyState
          title="No items"
          action={{
            label: "Create Item",
            onClick: onClick,
          }}
        />,
      );

      expect(
        screen.getByRole("button", { name: /create item/i }),
      ).toBeInTheDocument();
      await userEvent.click(
        screen.getByRole("button", { name: /create item/i }),
      );
      expect(onClick).toHaveBeenCalled();
    });

    it("renders secondary action button when provided", async () => {
      const onClick = jest.fn();
      render(
        <EmptyState
          title="No items"
          action={{
            label: "Delete",
            onClick: jest.fn(),
          }}
          secondaryAction={{
            label: "Cancel",
            onClick: onClick,
          }}
        />,
      );

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      expect(cancelButton).toBeInTheDocument();
      await userEvent.click(cancelButton);
      expect(onClick).toHaveBeenCalled();
    });
  });

  describe("SearchEmptyState", () => {
    it("renders with search term", () => {
      render(
        <SearchEmptyState searchTerm="test query" onClearSearch={jest.fn()} />,
      );

      // The component should show no results message with the search term
      expect(screen.getByText(/No results found for/i)).toBeInTheDocument();
      expect(screen.getByText(/test query/i)).toBeInTheDocument();
    });

    it("shows clear search button when search term provided", async () => {
      const onClearSearch = jest.fn();
      render(
        <SearchEmptyState searchTerm="test" onClearSearch={onClearSearch} />,
      );

      expect(
        screen.getByRole("button", { name: /clear search/i }),
      ).toBeInTheDocument();
    });
  });

  describe("DataEmptyState", () => {
    it("renders with default resource name", () => {
      render(<DataEmptyState />);
      expect(screen.getByText(/no .* yet/i)).toBeInTheDocument();
    });

    it("renders with custom resource name", () => {
      render(<DataEmptyState resourceName="customers" />);

      expect(screen.getByText(/no customers/i)).toBeInTheDocument();
    });

    it("shows create button when onCreateNew is provided", async () => {
      const onCreateNew = jest.fn();
      render(
        <DataEmptyState resourceName="customers" onCreateNew={onCreateNew} />,
      );

      expect(
        screen.getByRole("button", { name: /create customer/i }),
      ).toBeInTheDocument();
    });
  });

  describe("CreateEmptyState", () => {
    it("renders with default text", () => {
      render(<CreateEmptyState />);
      expect(screen.getByText(/ready to get started/i)).toBeInTheDocument();
    });

    it("shows create button when onCreate is provided", async () => {
      const onCreate = jest.fn();
      render(<CreateEmptyState onCreate={onCreate} />);

      expect(
        screen.getByRole("button", { name: /create/i }),
      ).toBeInTheDocument();
    });
  });

  describe("ErrorEmptyState", () => {
    it("renders with default text", () => {
      render(<ErrorEmptyState />);
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it("shows retry button when onRetry is provided", async () => {
      const onRetry = jest.fn();
      render(<ErrorEmptyState onRetry={onRetry} />);

      expect(
        screen.getByRole("button", { name: /try again/i }),
      ).toBeInTheDocument();
    });
  });

  describe("UnauthorizedEmptyState", () => {
    it("renders with default text", () => {
      render(<UnauthorizedEmptyState />);
      expect(screen.getByText(/access denied/i)).toBeInTheDocument();
    });

    it("shows login button when onLogin is provided", async () => {
      const onLogin = jest.fn();
      render(<UnauthorizedEmptyState onLogin={onLogin} />);

      expect(
        screen.getByRole("button", { name: /sign in/i }),
      ).toBeInTheDocument();
    });
  });
});
