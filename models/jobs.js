"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate, jobWhereClause } = require("../helpers/sql");

/** Related functions for companies. */

class Job {
  /** Create a Job (from data), update db, return new Job data.
   *
   * data should be { title, company_handle, equity, salary }
   *
   * Returns { id, title, salary, equity, company_handle }
   *
   * Throws BadRequestError if job in database.
   * */

    static async create({title, salary, equity, company_handle }) {
	console.log("hello")
    const duplicateCheck = await db.query(
        `SELECT title, company_handle
           FROM jobs
           WHERE title = $1 and company_handle = $2`,
        [title, company_handle]);

    if (duplicateCheck.rows[0])
	throw new BadRequestError(`Duplicate job: ${title} at ${company_handle}`);

    const result = await db.query(
        `INSERT INTO jobs
	(title, salary, equity, company_handle )
           VALUES ($1, $2, $3, $4)
           RETURNING title, salary, equity, company_handle`,
        [
          title,
          salary,
          equity,
          company_handle
        ],
    );
	const job = result.rows[0];
	return job;

  }

  /** Find all companies.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

    static async findAll(filters) {

	let whereClause = jobWhereClause (filters);
	const jobsRes = await db.query(
          `SELECT title,
                  salary,
                  equity,
		 company_handle
           FROM jobs ${whereClause.clause}
           ORDER BY title`, whereClause.values);
	       
    return jobsRes.rows;
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  // static async get(handle) {
  //   const companyRes = await db.query(
  //         `SELECT handle,
  //                 name,
  //                 description,
  //                 num_employees AS "numEmployees",
  //                 logo_url AS "logoUrl"
  //          FROM companies
  //          WHERE handle = $1`,
  //       [handle]);

  //   const company = companyRes.rows[0];

  //   if (!company) throw new NotFoundError(`No company: ${handle}`);

  //   return company;
  // }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity}
   *
   * Returns {title, salary, equity, company_handle}
   *
   * Throws NotFoundError if not found.
   */
  static async update(job_id, data) {

      if (typeof job_id !== 'number')
	  throw new NotFoundError(`No Job: ${job_id}`);
	  
      const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          title: "title",
          salary: "salary",
          equity: "equity",
        });

      
      const result  = await db.query(`UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${job_id}
                      RETURNING title, salary, equity, company_handle`, [...values]);

      const job = result.rows[0]
      if (!job) throw new NotFoundError(`No Job: ${job_id}`);
      return job;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

    static async remove(id) {

	if (typeof id !== 'number')
	  throw new NotFoundError(`No Job: ${id}`);

    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
        [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job_id: ${id}`);
  }
}


module.exports = Job;
