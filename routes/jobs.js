"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn , ensureAdmin} = require("../middleware/auth");
const Job = require("../models/jobs");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const jobQuerySchema = require ("../schemas/jobQuery.json");

const router = express.Router();


/** POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, company_handle }
 *
 * Returns { title, salary, equity, company_handle }
 *
 * Authorization required: login
 */

router.post("/", ensureAdmin, async function (req, res, next) {
    try {
	const validator = jsonschema.validate(req.body, jobNewSchema);

	if (!validator.valid) {
	    const errs = validator.errors.map(e => e.stack);
	    throw new BadRequestError(errs);
      }
	const job = await Job.create(req.body);
	return res.status(201).json({ job });
    } catch (err) {
    return next(err);
  }
});

/** GET /  =>
 *   
 *
 * Can filter on provided search filters:
 * - title
 * - salary
 * - equity
 *{ title, salary, equity, company_handle }
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
    try {
	const validator = jsonschema.validate(req.query, jobQuerySchema);
	if (!validator.valid) {
	    const errs = validator.errors.map(e => e.stack);
	    throw new BadRequestError(errs);
	}
	const jobs = await Job.findAll(req.query);

	return res.json({ jobs });
    } catch (err) {
	return next(err);
  }
});



/** GET /[id]  =>  { job }
 *
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */

router.get("/:id", ensureAdmin, async function (req, res, next) {
  try {
    const job = await Job.get(req.params.id);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});



module.exports = router;
