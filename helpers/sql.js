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
    console.log("BITCHES",dataToUpdate,jsToSql)
    const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
    const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
    );
    
    let x = {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
    };
    console.log("PUSSY",x)
  // return  {
  //   setCols: cols.join(", "),
  //   values: Object.values(dataToUpdate),
    // };
    return x;
}

module.exports = { sqlForPartialUpdate };
