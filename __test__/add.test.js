const add = require("../app/index");

describe("add function", () => {
  test("adds two numbers", () => {
    expect(add(2, 3)).toBe(5);
  });
});
