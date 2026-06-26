require('@testing-library/jest-dom');
const { toHaveNoViolations } = require('jest-axe');
expect.extend(toHaveNoViolations);

jest.mock('next/server', () => {
  class MockResponse {
    constructor(body, init) {
      this.bodyContent = body;
      this.status = init?.status ?? 200;
      this.headers = init?.headers ?? {};
    }
    text() {
      return Promise.resolve(this.bodyContent);
    }
  }
  return {
    NextResponse: MockResponse,
  };
});
