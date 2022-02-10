/** @typedef {import('express').RequestHandler} RequestHandler */

// const { Tax } = require('../models/tax-orm.js');
const dao  = require('../models/dao.js');
const lo     = require('lodash');

module.exports = {

//***projC
  getCatalog(req, res) {
    console.log(`From ${req.ip}, Request ${req.url}`)
    dao.getAllCatalogs(function (rows) {
        res.setHeader('Content-Type', 'application/json');
        res.write(JSON.stringify(rows));
        res.end();
    })
  },

//1
  getProductsByCategory(req, res) {
    console.log(`From ${req.ip}, Request ${req.url}`);
    dao.getProductsOfCategory(req.params.id, function (rows) {
      res.setHeader('Content-Type', 'application/json');
      res.write(JSON.stringify(rows));
      res.end();
    });
  },
  
  //2
  getProductById(req, res) {
    console.log(`From ${req.ip}, Request ${req.url}`);
    dao.getProduct(req.params.id, function (rows) {
      res.setHeader('Content-Type', 'application/json');
      res.write(JSON.stringify(rows[0]));
      res.end();
    });
  },
  
  //3
  getCart(req, res) {
    console.log(`From ${req.ip}, Request ${req.url}`);
    req.session.cart = req.session.cart || [];
    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify(req.session.cart));
    res.end();
  },
  
  //4
  updateCart(req, res) {
    console.log(`From ${req.ip}, Request ${req.url}`);
    const where = { id: req.body.id, qty: req.body.qty };
    req.session.cart = req.session.cart ||  [];

    // var item = req.session.cart.find(x => x.id == req.body.id);
    var index = lo.findIndex(req.session.cart, function(o) {return o.id == req.body.id;});
    if(index >= 0){
      if (req.body.qty > 0){
        req.session.cart.splice(index, 1, where);
      }
      else{
        lo.pullAt(req.session.cart, [index]);
      }
    }
    else if (req.body.qty > 0){
      req.session.cart.push(where);
    }
    console.log(req.session.cart);

    req.session.cart = req.session.cart || [];
    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify(req.session.cart));
    res.end();
  },
  //4
  // updateCart(req, res) {
  //   console.log(`From ${req.ip}, Request ${req.url}`);
  //   const where = { id: req.body.id };
  //   req.session.cart = req.session.cart || [];
  //   Product.findOne({ include, attributes, where }).then((product) => {
  //     let response;
  //     if (!product) {
  //       response = new Error('Product not found');
  //     } else {
  //       req.session.cart.push(product);
  //       response = req.session.cart.map(p => _.pick(p, attributes));
  //     }
  //     res.setHeader('Content-Type', 'application/json');
  //     res.write(JSON.stringify(response));
  //     res.end();
  //   });
  // },
};