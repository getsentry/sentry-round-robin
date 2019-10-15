const verifySignature = require("../verify");

describe("verify.js", () => {
  beforeAll(() => {
    process.env.SENTRY_API_SECRET = "abc123";
  });

  it("should verify a valid signature", () => {
    expect(verifySignature({
      body: { issue: 123456 },
      headers: {
        "Sentry-Hook-Signature": "0e2041f59516f3d4507b22216f2e0050931692c1ae71c4207d38d79781963dfa"
      }
    })).toBe(true);
  });
  
  it("should reject an invalid signature", () => {
    expect(verifySignature({
        body: { issue: 1234567890 },
        headers: {
          "Sentry-Hook-Signature": "0e2041f59516f3d4507b22216f2e0050931692c1ae71c4207d38d79781963dfa"
        }
      })).toBe(false);
  });
});
