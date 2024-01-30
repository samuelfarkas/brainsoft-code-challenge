import { build } from "../helper";

const app = build();

describe("pokemon endpoints", () => {
  describe("pokemon listing", () => {
    it("should return pokemon listing paginated - first page", async () => {
      const res = await app.inject({
        url: "/pokemon?first=5",
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
                rarity: expect.any(String),
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

    it("should return pokemon listing - second page", async () => {
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
              }),
            ),
          totalCount: expect.any(Number),
          hasNextPage: true,
          hasPrevPage: true,
        }),
      );
    });

    it("should return empty list if cursor exceedes number of items", async () => {
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

    it("should return paginated pokemon listing filtered by type", async () => {
      const res = await app.inject({
        url: "/pokemon?first=5&type=10",
      });
      const payload: { items: unknown[] } = res.json();
      expect(res.statusCode).toEqual(200);
      expect(payload.items.length).toBeGreaterThan(0);
      expect(payload).toEqual(
        expect.objectContaining({
          items: payload.items.map(() =>
            expect.objectContaining({
              id: expect.any(Number),
              types: expect.arrayContaining([
                expect.objectContaining({
                  id: 10,
                }),
              ]),
            }),
          ),
          totalCount: expect.any(Number),
        }),
      );
    });

    it("should return paginated pokemon listing filtered by fuzzy search", async () => {
      const res = await app.inject({
        url: "/pokemon?first=5&search=pikachu",
      });
      const payload: { items: unknown[] } = res.json();
      expect(res.statusCode).toEqual(200);
      expect(payload.items.length).toBeGreaterThan(0);
      expect(payload).toEqual(
        expect.objectContaining({
          items: payload.items.map(() =>
            expect.objectContaining({
              id: expect.any(Number),
              name: expect.stringMatching(/pikachu/i),
            }),
          ),
          totalCount: 1,
        }),
      );
    });
  });

  describe("pokemon by name", () => {
    it("should find pokemon by name", async () => {
      const res = await app.inject({
        url: "/pokemon/name/pikachu",
      });
      const payload = res.json();
      expect(res.statusCode).toEqual(200);
      expect(payload).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          name: expect.stringMatching(/pikachu/i),
        }),
      );
      expect(payload).toMatchSnapshot({});
    });

    it("should return not found if name does not exist", async () => {
      const res = await app.inject({
        url: "/pokemon/name/invalid",
      });
      expect(res.statusCode).toEqual(404);
    });
  });

  describe("pokemon by id", () => {
    it("should find pokemon by id", async () => {
      const res = await app.inject({
        url: "/pokemon/1",
      });
      const payload = res.json();
      expect(res.statusCode).toEqual(200);
      expect(payload).toEqual(
        expect.objectContaining({
          id: 1,
        }),
      );
      expect(payload).toMatchSnapshot({});
    });

    it("should return not found if id does not exist", async () => {
      const res = await app.inject({
        url: "/pokemon/0",
      });
      expect(res.statusCode).toEqual(404);
    });
  });
});
