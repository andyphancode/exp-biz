const request = require("supertest");

const app = require("../app");
const { createData } = require("../_test-common");
const db = require("../db");

// before every test
beforeEach(createData);


afterAll(async () => {
    process.env.NODE_ENV === "dev";
    await db.end()
});

describe("GET /", function () {

  test("Should respond with array of invoices", async function () {
    const response = await request(app).get("/invoices");
    expect(response.body).toEqual({
      "invoices": [
        {id: 1, comp_code: "apple"},
        {id: 2, comp_code: "apple"},
        {id: 3, comp_code: "ibm"},
      ]
    });
  })

});


describe("GET /1", function () {

  test("Should respond with info for 1 invoice", async function () {
    const response = await request(app).get("/invoices/1");
    expect(response.body).toEqual(
        {
          "invoice": {
            id: 1,
            amt: 100,
            add_date: '2018-01-01T08:00:00.000Z',
            paid: false,
            paid_date: null,
            company: {
              code: 'apple',
              name: 'Apple',
              description: 'Maker of OSX.',
            }
          }
        }
    );
  });

  test("Should return 404 if no invoice found", async function () {
    const response = await request(app).get("/invoices/999");
    expect(response.status).toEqual(404);
  })
});


describe("POST /", function () {

  test("Should add invoice", async function () {
    const response = await request(app)
        .post("/invoices")
        .send({amt: 999, comp_code: 'ibm'});

    expect(response.body).toEqual(
        {
          "invoice": {
            id: 4,
            comp_code: "ibm",
            amt: 999,
            add_date: expect.any(String),
            paid: false,
            paid_date: null,
          }
        }
    );
  });
});


describe("PUT /", function () {

  test("Should update an invoice", async function () {
    const response = await request(app)
        .put("/invoices/1")
        .send({amt: 1000, paid: false});

    expect(response.body).toEqual(
        {
          "invoice": {
            id: 1,
            comp_code: 'apple',
            paid: false,
            amt: 1000,
            add_date: expect.any(String),
            paid_date: null,
          }
        }
    );
  });

  test("Should return 404 for no invoice found", async function () {
    const response = await request(app)
        .put("/invoices/999")
        .send({amt: 1000});

    expect(response.status).toEqual(404);
  });

  test("Should return 500 for missing data", async function () {
    const response = await request(app)
        .put("/invoices/1")
        .send({});

    expect(response.status).toEqual(500);
  })
});


describe("DELETE /", function () {

  test("Should delete invoice", async function () {
    const response = await request(app)
        .delete("/invoices/1");

    expect(response.body).toEqual({"status": "deleted"});
  });

  test("Should return 404 for no invoice found", async function () {
    const response = await request(app)
        .delete("/invoices/999");

    expect(response.status).toEqual(404);
  });
});

