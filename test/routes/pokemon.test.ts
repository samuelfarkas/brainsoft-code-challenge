import { build } from "../helper";

const app = build();

describe("pokemon endpoints", () => {
  describe("pokemon listing", () => {
    it("should return pokemon listing paginated - first page", async () => {
      const res = await app.inject({
        url: "/pokemons?first=5",
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
        url: "/pokemons?first=5&cursor=5",
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
        url: "/pokemons?first=5&cursor=5",
      });
      const payload = res.json();
      expect(res.statusCode).toEqual(200);
      expect(payload.items.length).toEqual(5);

      const res2 = await app.inject({
        url: `/pokemons?first=5&cursor=${payload.totalCount + 1}`,
      });
      expect(res2.statusCode).toEqual(200);
      const payload2 = res2.json();
      expect(payload2.items.length).toEqual(0);
    });

    it("should return paginated pokemon listing filtered by type", async () => {
      const res = await app.inject({
        url: "/pokemons?first=5&type=10",
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
        url: "/pokemons?first=5&search=pikach",
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

    it("should return paginated pokemon listing filtered by favorite", async () => {
      const tokenRes = await app.inject({
        url: "/user/token",
        method: "POST",
      });

      const token = tokenRes.json().token;
      const favRes = await app.inject({
        url: "/pokemons/1/favorite",
        method: "PATCH",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      expect(favRes.statusCode).toEqual(204);
      const favRes2 = await app.inject({
        url: "/pokemons/2/favorite",
        method: "PATCH",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      expect(favRes2.statusCode).toEqual(204);

      const res = await app.inject({
        url: "/pokemons?first=5&favorite=true",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      const payload = res.json();

      expect(res.statusCode).toEqual(200);
      expect(payload.items.length).toEqual(2);
      expect(payload).toEqual(
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({
              id: 1,
            }),
            expect.objectContaining({
              id: 2,
            }),
          ]),
        }),
      );
    });

    it("should return unauthorized if favorite is set but no token is provided", async () => {
      const res = await app.inject({
        url: "/pokemons?first=5&favorite=true",
      });
      expect(res.statusCode).toEqual(401);
    });

    it("should delete favorite pokemon", async () => {
      const tokenRes = await app.inject({
        url: "/user/token",
        method: "POST",
      });

      const token = tokenRes.json().token;
      const favRes = await app.inject({
        url: "/pokemons/1/favorite",
        method: "PATCH",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      expect(favRes.statusCode).toEqual(204);

      const list1 = await app.inject({
        url: "/pokemons?first=5&favorite=true",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      expect(list1.statusCode).toEqual(200);
      const payload = list1.json();
      expect(payload.items.length).toEqual(1);

      const delFavRes = await app.inject({
        url: "/pokemons/1/favorite",
        method: "DELETE",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(delFavRes.statusCode).toEqual(204);
      const list2 = await app.inject({
        url: "/pokemons?first=5&favorite=true",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      expect(list2.statusCode).toEqual(200);
      const payload2 = list2.json();
      expect(payload2.items.length).toEqual(0);
    });

    it("should return unauthorized if favorite patch endpoint is called but no token is provided", async () => {
      const res = await app.inject({
        url: "/pokemons/1/favorite",
        method: "PATCH",
      });
      expect(res.statusCode).toEqual(401);
    });

    it("should return unauthorized if favorite delete endpoint is called but no token is provided", async () => {
      const res = await app.inject({
        url: "/pokemons/1/favorite",
        method: "DELETE",
      });
      expect(res.statusCode).toEqual(401);
    });
  });

  describe("pokemon by name", () => {
    it("should find pokemon by name", async () => {
      const res = await app.inject({
        url: "/pokemons/name/pikachu",
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
        url: "/pokemons/name/invalid",
      });
      expect(res.statusCode).toEqual(404);
    });
  });

  describe("pokemon by id", () => {
    it("should find pokemon by id", async () => {
      const res = await app.inject({
        url: "/pokemons/1",
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
        url: "/pokemons/0",
      });
      expect(res.statusCode).toEqual(404);
    });
  });
});
