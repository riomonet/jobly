"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate, getWhereClause } = require("../helpers/sql");

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

  //   static async findAll(filters) {

  // 	let whereClause = getWhereClause (filters);
  // 	const companiesRes = await db.query(
  //         `SELECT handle,
  //                 name,
  //                 description,
  //                 num_employees AS "numEmployees",
  //                 logo_url AS "logoUrl"
  //          FROM companies ${whereClause.clause}
  //          ORDER BY name`, whereClause.values);
	       
  //   return companiesRes.rows;
  // }

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

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  // static async update(handle, data) {
  //   const { setCols, values } = sqlForPartialUpdate(
  //       data,
  //       {
  //         numEmployees: "num_employees",
  //         logoUrl: "logo_url",
  //       });
  //   const handleVarIdx = "$" + (values.length + 1);

  //   const querySql = `UPDATE companies 
  //                     SET ${setCols} 
  //                     WHERE handle = ${handleVarIdx} 
  //                     RETURNING handle, 
  //                               name, 
  //                               description, 
  //                               num_employees AS "numEmployees", 
  //                               logo_url AS "logoUrl"`;
  //   const result = await db.query(querySql, [...values, handle]);
  //   const company = result.rows[0];

  //   if (!company) throw new NotFoundError(`No company: ${handle}`);

  //   return company;
  // }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

//   static async remove(handle) {
//     const result = await db.query(
//           `DELETE
//            FROM companies
//            WHERE handle = $1
//            RETURNING handle`,
//         [handle]);
//     const company = result.rows[0];

//     if (!company) throw new NotFoundError(`No company: ${handle}`);
//   }
// }

}
module.exports = Job;
