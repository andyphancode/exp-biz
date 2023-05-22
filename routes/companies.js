const express = require("express");
const ExpressError = require("../expressError")
const slugify = require("slugify")
const db = require("../db");

const router = new express.Router();

// GET list of companies

router.get("/", async function(req, res, next) {
    try {
        const result = await db.query(
            `SELECT code, name
            FROM companies
            ORDER BY name`);
        return res.json({"companies": result.rows});
    } catch (err) {
        return next(err);
    }
});

// GET company details

router.get("/:code", async function (req, res, next) {
    try {
        let code = req.params.code;
        const companyResult = await db.query(
            `SELECT code, name, description
            FROM companies
            WHERE code = $1`,
            [code]
        );

        const invoiceResult = await db.query (
            `SELECT id
            FROM invoices
            WHERE comp_code =$1`,
            [code]
        );

        if (companyResult.rows.length === 0) {
            throw new ExpressError(`No company found with code: ${code}`, 404)
        }

        const company = companyResult.rows[0];
        const invoices = invoiceResult.rows;

        company.invoices = invoices.map(invoice => invoice.id);

        return res.json({"company": company});
    } catch (err) {
        return next(err);
    }
});

// POST add new company

router.post("/", async function (req, res, next) {
    try {
        let {name, description} = req.body;
        let code = slugify(name, {lower: true});

        const result = await db.query(
            `INSERT INTO companies (code, name, description)
            VALUES ($1, $2, $3)
            RETURNING code, name, description`,
            [code, name, description]
        );

        return res.status(201).json({"company":result.rows[0]});
    } catch (err) {
        return next(err);
    }
});

// PUT update company

router.put("/:code", async function (req, res, next) {
    try {
        let {name, description} = req.body;
        let code = req.params.code;

        const result = await db.query(
            `UPDATE companies
            SET name=$1, description = $2
            WHERE code = $3
            RETURNING code, name, description`,
            [name, description, code]
        );

        if (result.rows.length === 0) {
            throw new ExpressError(`No company found with code: ${code}`, 404)             
        } else {
            return res.json({"company": result.rows[0]});
        }
    } catch (err) {
        return next(err);
    }
});


// DELETE delete a company

router.delete("/:code", async function(req, res, next) {
    try {
        let code = req.params.code;
        
        const result = await db.query(
            `DELETE FROM companies
            WHERE code = $1
            RETURNING code`,
            [code]
        );
        if (result.rows.length == 0) {
            throw new ExpressError(`No company found with code: ${code}`, 404)
          } else {
            return res.json({"status": "deleted"});
          }
        } catch (err) {
            return next(err);
        }
});

module.exports = router;