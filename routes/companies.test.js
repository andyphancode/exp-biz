const request = require("supertest");

const app = require("../app");
const { createData } = require("../_test-common");
const db = require("../db");

// before every test
beforeEach(createData);

afterAll(async () => {
    await db.end()
  });

describe("GET /", function () {

    test("Respond with array of companies", async function () {
      const response = await request(app).get("/companies");
      expect(response.body).toEqual({
        "companies": [
          {code: "apple", name: "Apple"},
          {code: "ibm", name: "IBM"},
        ]
      });
    })
  
  });
  
  
describe("GET /apple", function () {
  
    test("Return company info", async function () {
      const response = await request(app).get("/companies/apple");
      expect(response.body).toEqual(
          {
            "company": {
              code: "apple",
              name: "Apple",
              description: "Maker of OSX.",
              invoices: [1, 2],
            }
          }
      );
    });
  
    test("Return 404 for no company", async function () {
      const response = await request(app).get("/companies/fake");
      expect(response.status).toEqual(404);
    })
  });

describe("POST /", function () {

    test("Should add new company", async function () {
      const response = await request(app)
          .post("/companies")
          .send({name: "NewCompany", description: "new"});
  
      expect(response.body).toEqual(
          {
            "company": {
              code: "newcompany",
              name: "NewCompany",
              description: "new",
            }
          }
      );
    });
  
    test("Return 500 for conflict", async function () {
      const response = await request(app)
          .post("/companies")
          .send({name: "Apple", description: "12345"});
  
      expect(response.status).toEqual(500);
    })
  });

describe("PUT /", function () {

  test("It should update company", async function () {
    const response = await request(app)
        .put("/companies/apple")
        .send({name: "AppleEdit", description: "NewDescrip"});

    expect(response.body).toEqual(
        {
          "company": {
            code: "apple",
            name: "AppleEdit",
            description: "NewDescrip",
          }
        }
    );
  });

  test("It should return 404 for no-such-comp", async function () {
    const response = await request(app)
        .put("/companies/blargh")
        .send({name: "Blargh"});

    expect(response.status).toEqual(404);
  });

  test("It should return 500 for missing data", async function () {
    const response = await request(app)
        .put("/companies/apple")
        .send({});

    expect(response.status).toEqual(500);
  })
});

describe("PUT /", function () {

    test("Should update company", async function () {
      const response = await request(app)
          .put("/companies/apple")
          .send({name: "AppleEdit", description: "Editted Description"});
  
      expect(response.body).toEqual(
          {
            "company": {
              code: "apple",
              name: "AppleEdit",
              description: "Editted Description",
            }
          }
      );
    });
  
    test("Should return 404 if no company found", async function () {
      const response = await request(app)
          .put("/companies/fake")
          .send({name: "Fake"});
  
      expect(response.status).toEqual(404);
    });
  
    test("Should return 500 for missing data", async function () {
      const response = await request(app)
          .put("/companies/apple")
          .send({});
  
      expect(response.status).toEqual(500);
    })
  });

describe("DELETE /", function () {

  test("Should delete company", async function () {
    const response = await request(app)
        .delete("/companies/apple");

    expect(response.body).toEqual({"status": "deleted"});
  });

  test("Should return 404 for no company found", async function () {
    const response = await request(app)
        .delete("/companies/fake");

    expect(response.status).toEqual(404);
  });
});  