import { build } from "../helper";

const app = build();

describe("user endpoints", () => {
  it("should return user bearer token", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/user/token",
    });
    const payload = res.json();
    expect(res.statusCode).toEqual(201);
    expect(payload).toEqual(
      expect.objectContaining({
        token: expect.any(String),
      }),
    );
  });

  it("should return user entity", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/user/token",
    });
    const payload = res.json();
    expect(res.statusCode).toEqual(201);

    const res2 = await app.inject({
      url: "/user",
      headers: {
        authorization: `Bearer ${payload.token}`,
      },
    });

    expect(res2.statusCode).toEqual(200);
    expect(res2.json()).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
    );
  });

  it("should return unauthorized if token is invalid", async () => {
    const res = await app.inject({
      url: "/user",
      headers: {
        authorization: `Bearer fakeToken`,
      },
    });
    expect(res.statusCode).toEqual(401);
  });
});
