const os      = require('os');
const path    = require('path');
const sqlite3 = require('sqlite3');

const dbfile  = '4413/pkg/sqlite/Models_R_US.db';
const dbpath  = path.join(os.homedir(), ...dbfile.split('/'));
const db      = new (sqlite3.verbose()).Database(dbpath);

module.exports = {

//***projC
  getAllCatalogs(success, failure = console.log) {
    let statement = 'SELECT id, name FROM Category'

    db.all(statement, function (err, rows) {
      console.log(`${statement}`)
      if(err == null){
        success(rows)
      } else {
        failure(rows)
      }
    })
  },

  //Retrieves all Products of Category by catId
  getProductsOfCategory(catId, success, failure = console.log) {
    let statement = 'SELECT id, catId, name, description, cost FROM Product where catId = ?'
    db.all(statement,catId, function (err, rows) {
      console.log(`${statement} ${catId}`)
      if(err == null){
        success(rows)
      } else {
        failure(rows)
      }
    })
  },

  //Retrieves single Product by id
  getProduct(id, success, failure = console.log) {
    let statement = 'SELECT id, catId, name, description, cost FROM Product where id = ?'
    db.all(statement,id, function (err, rows) {
      console.log(`${statement} ${id}`)
      if(err == null){
        success(rows)
      } else {
        failure(rows)
      }
    })
  },

  //Retrieves the cart (dont think this is ever used but just gonna leave it..)
  getCart(success, failure = console.log) {
    let statement = 'SELECT id, qty FROM Cart'
    db.all(statement, function (err, rows) {
      console.log(`${statement}`)
      if(err == null){
        success(rows)
      } else {
        failure(rows)
      }
    })
  }


}