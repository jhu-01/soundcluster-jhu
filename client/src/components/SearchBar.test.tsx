import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SearchBar } from "./SearchBar";

describe("SearchBar", () => {
  it("submits a trimmed search query", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchBar message="" onSearch={onSearch} status="idle" />);

    await user.type(
      screen.getByPlaceholderText("Search by song title or artist..."),
      "  midnight  ",
    );
    await user.click(screen.getByRole("button", { name: "Search" }));

    expect(onSearch).toHaveBeenCalledWith("midnight");
  });

  it("shows validation when the query is empty", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchBar message="" onSearch={onSearch} status="idle" />);

    await user.click(screen.getByRole("button", { name: "Search" }));

    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.getByText("Search query is required.")).toBeInTheDocument();
  });
});
