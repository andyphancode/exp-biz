const express = require("express");
const ExpressError = require("../expressError")
const db = require("../db");

const router = new express.Router();

// GET list of industries with companies

router.get("/", async function(req, res, next) {
    try {
        const result = await db.query(
            `SELECT i.code, c.company_code 
            FROM industries AS i 
            LEFT JOIN companies_industries 
            AS c ON i.code = c.industry_code`);

        return res.json({"industries": result.rows});
        
    } catch (err) {
        return next(err);
    }
});

// POST add new industry

router.post("/", async function (req, res, next) {
    try {
        let { code, industry } = req.body;

        const result = await db.query(
            `INSERT INTO industries (code, industry)
            VALUES ($1, $2)
            RETURNING code, industry`,
            [code, industry]
        );

        return res.status(201).json({"industry": result.rows[0]});
    } catch (err) {
        return next(err);
    }
});

// POST associate company to industry

router.post("/:code", async function(req, res, next) {

    try {
        const industry_code = req.params.code;
        let company_code = req.body.company_code;

        const industryResult = await db.query(
            `SELECT code, industry
            FROM industries
            WHERE code = $1`,
            [industry_code]
        );

        if (industryResult.rows.length === 0) {
            throw new ExpressError(`No industry found with code: ${industry_code}`, 404);
        }

        const result = await db.query(
            `INSERT INTO companies_industries (company_code, industry_code)
            VALUES ($1, $2)
            RETURNING company_code, industry_code`,
            [company_code, industry_code]
        );

        return res.status(201).json(result.rows[0]);

    } catch (err) {
        return next(err);
    }
});

module.exports = router;