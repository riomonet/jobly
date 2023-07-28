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


//***********************************************************************************UPDDAY WORKING HERE

describe("update", function () {
    const updateData = {
    title: "j5",
    company_handle: "c1",
    salary: 5,
    equity: "0.5"
    };
    async function getId(job, company) {

	let results = await db.query (
	    `SELECT id FROM jobs WHERE title = '${job}' and
	company_handle = '${company}'`)
	return results.rows[0].id
	
    }

    test("works", async function () {

	const id = await getId('j1','c1')
	const job = await Job.update(id, updateData);
	expect(job).toEqual({
	    title: "j5",
	    ...updateData,
	});

    const result = await db.query(
        `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE title = 'j5' and company_handle = 'c1'`);
    expect(result.rows).toEqual([{
	company_handle: "c1",
	title: "j5",
	salary: 5,
	equity: "0.5"
    }]);
    });


  test("works: null fields", async function () {
      const updateDataSetNulls = {
	  company_handle: "c1",
	  title: "new",
	  salary: null,
	  equity: null,
    };


      const id = await getId('j1','c1')
      let job = await Job.update(id, updateDataSetNulls);
    expect(job).toEqual({
      title: "new",
      ...updateDataSetNulls,
    });


    const result = await db.query(
        `SELECT title, salary,equity,company_handle
           FROM jobs
           WHERE id = ${id}`);
    expect(result.rows).toEqual([{
      company_handle: "c1",
      title: "new",
      salary: null,
      equity: null,
    }]);
  });

  test("not found if no such job", async function () {
    try {
	await Job.update(1000002, updateData);
	fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
      try {
	  const id =  await getId('j1','c1')
	await Job.update(id, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});



/************************************** remove */

describe("remove", function () {

    async function getId(job, company) {
	
	let results = await db.query (
	`SELECT id FROM jobs WHERE title = '${job}' and
	company_handle = '${company}'`)
	return results.rows[0].id

    }

    test("works", async function () {
	let id = await getId('j1','c1')
	await Job.remove(id);
	const res = await db.query(
           `SELECT id FROM jobs WHERE id = ${id}`);
	expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(1000);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** get */

describe("get", function () {

    async function getId(job, company) {
	
	let results = await db.query (
	`SELECT id FROM jobs WHERE title = '${job}' and
	company_handle = '${company}'`)
	return results.rows[0].id

    }

    test("works", async function () {
	const id = await getId('j1','c1')
	let job = await Job.get(id);
    expect(job).toEqual({
	title: "j1",
	salary: 1,
	equity: "0.1",
	company_handle: "c1"
    });
  });

    test("not found if no such company", async function () {

    try {
      await Job.get(100000);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});




