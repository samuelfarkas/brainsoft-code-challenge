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
            // skip check for optional relations due skipped seed control in tests
            expect.objectContaining({
              id: index + 1,
              catalogId: expect.any(String),
              fleeRate: expect.any(Number),
              maxCP: expect.any(Number),
              maxHP: expect.any(Number),
              classification: {
                id: expect.any(Number),
                name: expect.any(String),
              },
              types: expect.arrayContaining([
                {
                  id: expect.any(Number),
                  name: expect.any(String),
                },
              ]),
              weaknesses: expect.arrayContaining([
                {
                  id: expect.any(Number),
                  name: expect.any(String),
                },
              ]),
              resistant: expect.arrayContaining([
                {
                  id: expect.any(Number),
                  name: expect.any(String),
                },
              ]),
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

  test("pokemon listing - cursor pagination exceeded total count", async () => {
    const res = await app.inject({
      url: "/pokemon?first=5&cursor=5",
    });
    const payload = res.json();
    expect(res.statusCode).toEqual(200);
    expect(payload.items.length).toEqual(5);

    const res2 = await app.inject({
      url: `/pokemon?first=5&cursor=${payload.totalCount + 1}`,
    });
    expect(res2.statusCode).toEqual(200);
    const payload2 = res2.json();
    expect(payload2.items.length).toEqual(0);
  });
});
