/** @typedef {import('express').Application} Application */

const productApi = require('./controllers/product-api');


module.exports = {

  /**
   * Defines and binds each URI endpoint and HTTP method
   * to specific RequestHandler functions.
   *
   * @param {Application} app
   */
  configureRoutes(app) {
    app.get('/api/catalog',               productApi.getCatalog); //***projC
    app.get('/api/products/category/:id', productApi.getProductsByCategory); //1
    app.get('/api/products/:id',          productApi.getProductById);        //2
    app.get('/api/cart',                  productApi.getCart);               //3
    app.post('/api/cart/update',          productApi.updateCart);            //4
  }
};
