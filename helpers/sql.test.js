const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", function () {
    let cols = { firstName: 'first_name', lastName: 'last_name', isAdmin: 'is_admin' };
    
  test("values", function () {
      let results = sqlForPartialUpdate( {firstname : "Harvey"}, cols )
      expect(results).toEqual({
	  setCols: '"firstname"=$1',
	  values: [ 'Harvey' ]
      });
  });

  test("values", function () {
      let results = sqlForPartialUpdate( {lastname : "smith"}, cols )
      expect(results).toEqual({
	  setCols: '"lastname"=$1',
	  values: [ 'smith' ]
      });
  });

   test("values", function () {
       let results = sqlForPartialUpdate( {firstname: "sally", lastname : "fields"}, cols )
      expect(results).toEqual({
	  setCols: '"firstname"=$1, "lastname"=$2',
	  values: [ 'sally' ,'fields']
      });
  });
});

