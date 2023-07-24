"use strict";
const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./jobs.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
      company_handle: "c1",
      title: "j4",
      salary: 4,
      equity: "0.4",
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual(newJob);

    const result = await db.query(
        `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE title = 'j4' and company_handle = 'c1'`);
    expect(result.rows).toEqual([
      {
      company_handle: "c1",
      title: "j4",
      salary: 4,
      equity: "0.4",
      },
      ]);
      
  });

  test("bad request with dupe", async function () {
    try {
      await Job.create(newJob);
      await Job.create(newJob);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});


/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
	{
	    title: "j1",
	    salary: 1,
	    equity: "0.1",
	    company_handle: "c1"
      },
	{
	    title: "j2",
	    salary: 2,
	    equity: "0.2",
	    company_handle: "c2"
      },
	{
	    title: "j3",
	    salary: 3,
	    equity: "0.3",
	    company_handle: "c3"
      },
    ]);
  });
});
/************************************** findAllWithFilter */

describe("findAll", function () {
  test("filter by name", async function () {
      let jobs = await Job.findAll({title: "j1"});
    expect(jobs).toEqual([
	{
	    title: "j1",
	    salary: 1,
	    equity: "0.1",
	    company_handle: "c1"
	}
    ]);
  });

  test("filter by minSalary", async function () {
      let jobs = await Job.findAll({minSalary: 2});
      expect(jobs).toEqual([
	  	{
	    title: "j2",
	    salary: 2,
	    equity: "0.2",
	    company_handle: "c2"
		},

	  {
	    title: "j3",
	    salary: 3,
	    equity: "0.3",
	    company_handle: "c3"
	}
    ]);
  });


    test("filter by hasEquity", async function () {
	let jobs = await Job.findAll({hasEquity : 0});
	expect(jobs).toEqual([
	    	{
	    title: "j1",
	    salary: 1,
	    equity: "0.1",
	    company_handle: "c1"
      },
	  	{
	    title: "j2",
	    salary: 2,
	    equity: "0.2",
	    company_handle: "c2"
		},

	  {
	    title: "j3",
	    salary: 3,
	    equity: "0.3",
	    company_handle: "c3"
	}
    ]);
  });
});
