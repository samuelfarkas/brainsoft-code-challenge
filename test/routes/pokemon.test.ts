import { build } from "../helper";

const app = build();

describe("pokemon", () => {
  test("pokemon listing - cursor pagination", async () => {
    const res = await app.inject({
      url: "/pokemon?first=5&cursor=0",
    });
    const payload = res.json();
    expect(res.statusCode).toEqual(200);
    expect(payload.items.length).toEqual(5);
    expect(payload).toEqual(
      expect.objectContaining({
        items: Array(5)
          .fill(null)
          .map((_, index) =>
            expect.objectContaining({
              id: index + 1,
              catalogId: expect.any(String),
              fleeRate: expect.any(Number),
              maxCP: expect.any(Number),
              maxHP: expect.any(Number),
              weightKg: {
                maximum: expect.any(Number),
                minimum: expect.any(Number),
              },
              heightMeters: {
                maximum: expect.any(Number),
                minimum: expect.any(Number),
              },
            }),
          ),
        totalCount: expect.any(Number),
        hasNextPage: true,
        hasPrevPage: false,
      }),
    );
  });

  test("pokemon listing - cursor pagination - second page", async () => {
    const res = await app.inject({
      url: "/pokemon?first=5&cursor=5",
    });
    const payload = res.json();
    expect(res.statusCode).toEqual(200);
    expect(payload.items.length).toEqual(5);
    expect(payload).toEqual(
      expect.objectContaining({
        items: Array(5)
          .fill(null)
          .map((_, index) =>
            expect.objectContaining({
              id: index + 6,
              catalogId: expect.any(String),
              fleeRate: expect.any(Number),
              maxCP: expect.any(Number),
              maxHP: expect.any(Number),
              weightKg: {
                maximum: expect.any(Number),
                minimum: expect.any(Number),
              },
              heightMeters: {
                maximum: expect.any(Number),
                minimum: expect.any(Number),
              },
            }),
          ),
        totalCount: expect.any(Number),
        hasNextPage: true,
        hasPrevPage: true,
      }),
    );
  });
});
