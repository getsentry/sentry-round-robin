const verifySignature = require("../verify");

describe("verify.js", () => {
  it("should verify a valid signature", () => {
    expect(verifySignature({
      body: { issue: 123456 },
      headers: {
        "sentry-hook-signature": "0e2041f59516f3d4507b22216f2e0050931692c1ae71c4207d38d79781963dfa"
      }
    }, "abc123")).toBe(true);
  });
  
  it("should reject an invalid signature", () => {
    expect(verifySignature({
        body: { issue: 1234567890 },
        headers: {
          "sentry-hook-signature": "0e2041f59516f3d4507b22216f2e0050931692c1ae71c4207d38d79781963dfa"
        }
      }, "abc123")).toBe(false);
  });
});
