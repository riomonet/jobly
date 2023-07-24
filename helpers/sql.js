const { BadRequestError } = require("../expressError");

/*
  Purpose: to return an object containing a formatted string and an array of values
  to be used in an sql UPDATE query.
  the formattd string is in the form  k1=$1, k2=$2, etc..
  the k values inlcuded depend on what is passed in the value dataToUpdate.
  dataToUpdate, will usually contain the value pointed at by req.body.
  The value array returned contain the values from req.body for $1,$2, etc..
  */
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
    const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
    const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
    );

    return  {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
    };
}

/* Renders and Returns an SQL WHERE clause, as a string, based on the
   value of the paramater, 'body'.  'Body' is an object that may
   contain 0-3 properties. Each properties key corresponds with a
   database column.  Each properties value is the value to filter on.
   */

function getWhereClause (body) {

    let res = {clause: "", values: []}

    if (body === undefined)
	return res

    let k = Object.keys(body)
    
    if (k.length === 0)
	return res

    if (k.includes('minEmployees') && k.includes('maxEmployees')){
	if (body.minEmployees > body.maxEmployees)
	    throw new BadRequestError(errs)
    }


    res = k.reduce((acc, cur, idx) => {

	let tmp = acc;
	if (cur === 'name')
	    tmp += ` name = `;
	if (cur === 'minEmployees')
	    tmp += ` num_employees >= `;
	if (cur === 'maxEmployees')
	    tmp += ` num_employees <= `;

	tmp += `$${idx + 1}`;
	if(idx < k.length -1)
	    tmp += ', ';

	return tmp;
    
    }, 'WHERE')

return { clause: res, values: Object.values(body) }

}


module.exports = { sqlForPartialUpdate , getWhereClause};


