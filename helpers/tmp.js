let body = {minEmployees : 2, name : 'fred'};

function getWhereClause (body) {

    let k = Object.keys(body)

// if (keys.length === 0) throw new BadRequestError("No data");

    let res = k.reduce((acc, cur, idx) => {

	let tmp = acc;
	if (cur === 'name')
	    tmp += ` name = `;
	if (cur === 'minEmployees')
	    tmp += ` employees >= `;
	if (cur === 'maxEmployees')
	    tmp +=  ` employees <= `;

	tmp += `$${idx + 1}`;
	if(idx < k.length -1)
	    tmp += ', ';

	return tmp;
    
    }, 'WHERE')

return { clause: res, values: Object.values(body) }

}

let whereClause = getWhereClause(body)

let str = `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies ${whereClause.clause}
           ORDER BY name`;

let values =  whereClause.values;

console.log( str,',', values)



