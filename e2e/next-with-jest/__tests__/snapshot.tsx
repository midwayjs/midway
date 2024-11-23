/**
 * @jest-environment jsdom
 */
import { render } from "@testing-library/react";
import Home from "@/app/page";

it("renders homepage unchanged", () => {
  const { container } = render(<Home />);
  expect(container).toMatchSnapshot();
});
