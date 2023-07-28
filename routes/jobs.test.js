"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
    u1Token,
    u2Token
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /job */



describe("POST /jobs", function () {
  const newJob = {
      company_handle: "c1",
      title: "New",
      salary: 100,
      equity: 0.1,
  };

    test("ok for admin", async function () {
    const resp = await request(app)
          .post("/jobs")
          .send(newJob)
          .set("authorization", `Bearer ${u1Token}`);
	expect(resp.statusCode).toEqual(201);
	expect(resp.body).toEqual({
	    job: {...newJob, equity: "0.1"},
	});
    });

      test("unauthorized", async function () {
    const resp = await request(app)
        .post("/jobs")
          .send({
	      title: "j4",
              company_handle: "c1",
              salary: 10,
	      equity: 0.1
        })
        .set("authorization", `Bearer ${u2Token}`);
	  expect(resp.statusCode).toEqual(401);
      });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/jobs")
          .send({
	      title: "j5",
              company_handle: "c1",
              salary: 10,
	      equity: 3
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});




/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
      expect(resp.body).toEqual({
      jobs:
          [
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

          ],
    });
  });


    test("invalid query string", async function () {
	const resp = await request(app).get("/jobs").query({office: 1});
	expect(resp.statusCode).toEqual(400);
    });

     test("equity > 1", async function () {
	 const resp = await request(app).get("/companies").query({equity: 3});
	expect(resp.statusCode).toEqual(400);
     });
    
  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app)
        .get("/jobs")
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /companies/:handle */

describe("GET /jobs/:id", function () {

    async function getId(job, company) {
	let results = await db.query (
	`SELECT id FROM jobs WHERE title = '${job}' and
	company_handle = '${company}'`)
	return results.rows[0].id
    }
    
    test("works for admin", async function () {
	const id = await getId('j1','c1')
	const resp = await request(app).get(`/jobs/${id}`).set("authorization", `Bearer ${u1Token}`);
	expect(resp.body).toEqual({
	job: {
	    title: "j1",
		  salary: 1,
	    equity: "0.1",
		  company_handle: "c1"
	}
	});
    });

    test("works doens not work for non admin", async function () {
	const id = await getId('j1','c1')
	const resp = await request(app).get(`/jobs/${id}`).set("authorization", `Bearer ${u2Token}`);
	expect(resp.statusCode).toEqual(401);
    });


  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/10000`).set("authorization", `Bearer ${u1Token}`);;
    expect(resp.statusCode).toEqual(404);
  });
});

// /************************************** PATCH /companies/:handle */

describe("PATCH /companies/:handle", function () {

    async function getId(job, company) {
	let results = await db.query (
	`SELECT id FROM jobs WHERE title = '${job}' and
	company_handle = '${company}'`)
	return results.rows[0].id
    }
    
    
    test("works for users", async function () {
	const id = await getId('j1','c1')
    const resp = await request(app)
          .patch(`/jobs/${id}`)
        .send({
          title: "j1-new",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
	job: {
        title: "j1-new",
        salary: 1,
        equity: "0.1",
	company_handle: "c1"
      },
    });
  });

    test("unauth for anon", async function () {
	const id = await getId('j1','c1')
    const resp = await request(app)
          .patch(`/jobs/${id}`)
        .send({
          name: "C1-new",
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such company", async function () {
    const resp = await request(app)
        .patch(`/jobs/-1`)
        .send({
          title: "new nope",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });

    test("bad request on handle change attempt", async function () {
	const id = await getId('j1','c1')
    const resp = await request(app)
          .patch(`/jobs/${id}`)
        .send({
          company_handle: "c1-new",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

    test("bad request on invalid data", async function () {
	const id = await getId('j1','c1')
    const resp = await request(app)
          .patch(`/jobs/${id}`)
        .send({
          salary: "no money bitch",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

    test("unauthorized", async function () {
	const id = await getId('j1','c1')
    const resp = await request(app)
          .patch(`/jobs/${id}`)
        .send({
          handle: "alt",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

});

/************************************** DELETE /companies/:handle */

describe("DELETE /jobs/:id", function () {

    async function getId(job, company) {
	let results = await db.query (
	`SELECT id FROM jobs WHERE title = '${job}' and
	company_handle = '${company}'`)
	return results.rows[0].id
    }

    test("works for admin", async function () {
	const id = await getId('j1','c1')
	const resp = await request(app)
          .delete(`/jobs/${id}`)
        .set("authorization", `Bearer ${u1Token}`);
	expect(resp.body).toEqual({ deleted: `${id}` });
  });

    test("unauth for anon", async function () {
	const id = await getId('j1','c1')
    const resp = await request(app)
          .delete(`/jobs/${id}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
        .delete(`/job/100000`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });

    test("unauthorized", async function () {
	const id = await getId('j1','c1')
       const resp = await request(app)
             .delete(`/jobs/${id}`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

});
