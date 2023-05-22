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


describe("GET /", function (){

    test("Respond with array of industries", async function() {
        const response = await request(app).get("/industries");
        expect(response.body).toEqual({
            "industries": [
                { code: 'tech', company_code: 'apple'},
                { code: 'tech', company_code: 'ibm'},
                { code: 'hosp', company_code: 'apple'},
                { code: 'acct', company_code: 'ibm'}                
            ]
        });
    })
});

describe("POST /", function(){
    test("Should add new industry", async function() {
        const response = await request(app)
            .post("/industries")
            .send({code:'food', industry:'food'});
        expect(response.body).toEqual(
            {
                "industry":
                {code:'food',
                industry:'food'}
            }
        );
    })
});

describe("POST /hosp", function (){
    test("Should associate industry with company", async function () {
        const response = await request(app)
            .post("/industries/hosp")
            .send({company_code: 'ibm'});
        expect(response.body).toEqual(
            {company_code: 'ibm', industry_code:'hosp'}
        );
    });

    test("Should return 500 if no company found", async function () {
        const response = await request(app)
            .post("/industries/hosp")
            .send({company_code: 'fake'});
        expect(response.status).toEqual(500);
    });

    test("Should return 404 if no industry found", async function () {
        const response = await request(app)
        .post("/industries/fake")
        .send({company_code: 'ibm'});
        expect(response.status).toEqual(404);
    });


})