// const { getProductById } = require("../../controllers/product-api");

(function () {
    'use strict';
  
    /**
     * Supplant does variable substitution on the string. It scans through the
     * string looking for expressions enclosed in {{ }} braces. If an expression
     * is found, use it as a key on the object, and if the key has a string value
     * or number value, it is substituted for the bracket expression and it repeats.
     * This is useful for automatically fixing URLs or for templating HTML.
     * Based on: http://www.crockford.com/javascript/remedial.html
     *
     * @param {string} str
     * @param {object} object
     * @returns {string}
     */
    function supplant(str, object) {
      return str.replace(
        /\{\{[ ]*([^{} ]*)[ ]*\}\}/g,
        function (a, b) {
          let r = object[b];
          return typeof r === 'string' || typeof r === 'number' ? r : a;
        }
      );
    }
  
    /**
     * Make an AJAX request with XHR. Returns a Promise.
     *
     * @param {string} url
     * @param {'GET'|'POST'|'PUT'|'HEAD'|'DELETE'} method
     * @param {*} data
     * @returns {Promise}
     */
    function doAjax(url, method, data) {
      const request = new XMLHttpRequest();                    // create the XHR request
      return new Promise(function (resolve, reject) {          // return it as a Promise
        request.onreadystatechange = function () {             // setup our listener to process compeleted requests
          if (request.readyState !== 4) return;                // only run if the request is complete
          if (request.status >= 200 && request.status < 300) { // process the response, when successful
            resolve(JSON.parse(request.responseText));
          } else { // when failed
            reject({
              status: request.status,
              statusText: request.statusText
            });
          }
        };
        request.open(method || 'GET', url, true);                       // setup our HTTP request
        if (data) {                                                     // when data is given...
          request.setRequestHeader("Content-type", "application/json"); // set the request content-type as JSON, and
          request.send(JSON.stringify(data));                           // send data as JSON in the request body.
        } else {
          request.send(); // send the request
        }
      });
    }
  
    /**
     * Invoke the route associated with the given URL hash. If no route matches,
     * redirects to the default route.
     *
     * @param {string} hash
     */
    function invokeRoute(hash) {
      if (hash.startsWith('#/')) {
        const [ route, ...params ] = hash.substr(2).split('/');
        if (routes[route]) {
          routes[route](...params);
        } else {
          routes.index();
        }
      } else {
        routes.index();
      }
    }
  
    /**
     * Actually change the content of the view. Replaces the innerHTML in the
     * #page element, and then updates the history, either by pushing a new state
     * or replacing the existing state if this is a redirection.
     *
     * @param {string} url
     * @param {string} title
     * @param {string} html
     * @param {boolean} isRedirect
     */
    function changeView(url, title, html, isRedirect = false) {
      const data = { url, title, html };
      document.title = title;
      document.getElementById('page').innerHTML = html;
      if (window.location.hash !== url) {
        if (isRedirect) {
          window.history.replaceState(data, '', url);
        } else {
          window.history.pushState(data, '', url);
        }
      }
    }
  
    const GetCatalog            = '/api/catalog'; // From Project C
    const GetProductsByCategory = '/api/products/category/:id';
    const GetProductById        = '/api/products/:id';
    const GetCart               = '/api/cart';
    const UpdateCart            = '/api/cart/update';
  
    const templates = {};
    const routes = {
      catalog(isRedirect) {
        /**
          TODO:
            1. GET all of the categories via the Catalog API
            2. Populate the templates:
                - category-card for each category
                - catalog-page for the page
            3. Show the view at the hash '#/catalog'
                - set the title to 'Catalog'
                - include the isRedirect as the last argument of changeView().
            4. Add a 'click' event listener to each div.category-card to show the category view.
                - Hint: use `document.querySelectorAll` to get all of the div.category-card's, then use the
                  'forEach((element) => { ... })' method in the returning nodelist to add the 'click' event listeners to each.    
                - you can get the corresponding Category ID for each category-card via: 
                  `element.dataset.id` (to get the 'data-id' attribute).
        */
        doAjax(GetCatalog).then((categories) => {
                                                                                                        
          const content = categories.map(t => supplant(templates['category-card'], t)).join('');
          const html    = supplant(templates['catalog-page'], { content });

          changeView('#/catalog', 'Catalog', html, isRedirect);
          
          document.querySelectorAll('div.category-card').forEach((element) => {
            // const catId = element.dataset.id;
            element.addEventListener("click", function (event) {
              const catId = element.dataset.id;
              routes.category(catId)
            })
          })
        })
      },
      category(id) {

        // 1. GET all of the categories via the Catalog API 
        doAjax(GetCatalog).then((category) => {
        //     - Find the category that matches the given ID.
          const e = category.find(e => e.id == id);
          console.log(e);
        //     - If category does not exist, redirect view to routes.index().
          if(!e){
            routes.index();
          } else {
        // 2. GET all the products that belong that category via ProductsByCategory API.
            doAjax(GetProductsByCategory.replace(':id', id)).then((products) => {
        // 3. Populate the templates:
        //     - category-card for the title  
              const title = supplant(templates['category-card'], e);
        //     - product-card for each product
              const content = products.map(p => supplant(templates['product-card'], p)).join('');
        //     - category-page for the page
              const html = supplant(templates['category-page'], { title, content });
        // 4. Show the view at '#/category/:id' where :id is the category's ID.
        //     - set the title to the category's name    
              changeView('#/category/' + id, e.name, html);
        // 5. Add a 'click' event listener to the div.category-card to return to the Catalog view.    
              document.querySelectorAll('.category-card').forEach((element) => {
                element.addEventListener('click', function(){
                  routes.index();
                });
              });
            });
          }
        });
      },

      async products(id) {
      // TODO:
      //   1. GET the product that matches the given ID via the ProductById API
        const product = await doAjax(GetProductById.replace(':id', id));
      //       - If the product does not exist, redirect view to routes.index().
      //   2. GET all of the categories via the Catalog API
      //       - Find the category that matches the product's ID.
        const category = await doAjax(GetCatalog);
        const e = category.find(x => x.id == product.catId);
        console.log(e);
        if (!e) {
          routes.index();
        } else {
      //   3. GET all the products that belong that category via ProductsByCategory API.
          const products = await doAjax(GetProductsByCategory.replace(':id', e.id));
      //   4. Populate the templates:
      //       - category-card for the title
          const title = supplant(templates['category-card'], e);
      //       - product-card for each product
          const content = products.map(p => supplant(templates['product-card'], p)).join('');
      //       - category-page for the page
          const html = supplant(templates['category-page'], { title, content });
      //       - product-page for the product
          const page = supplant(templates['product-page'], product);
      //         - fix the product's cost to be show 2 decimals. (use the toFixed method)
      //   5. Show the view at '#/products/:id' where :id is the product's ID.
      //       - set the title to the product's name
      //       - the HTML is the populated category-page template
          changeView('#/products/' + id, product.name, html);
      //   6. Add a 'click' event listener to the div.category-card to return to the Catalog view.
          document.querySelectorAll('.category-card').forEach((element) => {
            element.addEventListener('click', function () {
              routes.index();
            });
          });
      //   7. Replace the content of 'product-info' (id) element:
      //       - with the populated product-page template
          document.getElementById('product-info').innerHTML = page;
      //   8. Find the product-card <a> tag with the data-id that matches the given ID:
      //       - append the CSS class 'active' (remember to prefix it with a whitespace)
      //       - set the initial focus on that element (invoke the element's focus method). (fixes UI bug in list view)
          const elem = document.querySelector(`.product-card[data-id="${id}"]`)
          elem.classList.add('active');
          elem.focus();
      //   9. Add a 'click' event listener to the 'add-to-cart' button that:
      //       - GET all of items in the cart via Cart API
      //         - Find the item in the cart that matches the product, increment the qty by 1
      //         - If the item does not exist, let the qty be 1.
      //       - POST to UpdateCart API with the ID and new qty. (pass as the data argument to doAjax)
      //       - Show the Cart page.
          document.querySelector('button.add-to-cart').addEventListener('click', () => {
            doAjax(GetCart).then((cart) => {
              var item = cart.find(x => x.id == id);
              let qty;
              if (item != null) {
                qty = item.qty + 1;
              }
              else { qty = 1; }
              let obj = { id: id, qty: qty };
              doAjax(UpdateCart, "POST", obj).then((cart2) => {
              })
              routes.cart();
            });
          }); 
        }
      },
      cart() {
      // TODO:
      //   1. GET all of items in the cart via Cart API
      doAjax(GetCart).then(cart => {
        Promise.all(cart.map(item => doAjax(GetProductById.replace(':id', item.id)))).then(products => {
      //   2. For each item in the cart, GET the product via the ProductById API
      //       - Use Promise.all to synchronise all the requests
      //   3. When all of the request are resolved, populate the templates:
      //       - cart-row for each item
      //         - fix the product's cost to be show 2 decimals. (use the toFixed method)
          products.forEach(p => {p.cost = p.cost.toFixed(2)});
      //         - supplant the cart-row template with id and qty from the cart item
      //         - supplant the cart-row template with name and cost from the Product object
          const content = cart.map((item, i) => supplant(supplant(templates['cart-row'], item), products[i])).join('');
      //       - cart-page for the page
          const html    = supplant(templates['cart-page'], { content });
      //   4. Show the view at the hash '#/cart'
      //       - set the title to 'Cart'
          changeView(`#/cart`, 'Cart', html);
      //   5. Add a 'click' event listener to each 'update-cart' button that:
      //       - Hint: use `document.querySelectorAll` to get all of the button.update-cart's, then use the
      //         'forEach((button) => { ... })' method in the returning nodelist to add the 'click' event listeners to each. 
          document.querySelectorAll('.update-cart').forEach(btn => {   
            btn.addEventListener('click', () => {
      //       - Get the corresponding Product ID for each update-cart button via: 
      //         `button.dataset.id` (to get the 'data-id' attribute).
              let id  = btn.dataset.id;
              let qty = +(document.getElementById(`qty-${id}`).value);
      //       - POST to UpdateCart API with the ID and new qty in the adjacent input. (the input's ID is `qty-${id}`)
              doAjax(UpdateCart, 'POST', { id, qty }).then(() => {
      //         - pass POST data to doAjax as the data argument
      //         - to get the value of an input, use the value attribute on the element.
                routes.cart();
      //       - Refresh the Cart view.
      //       - Popup a message 'Cart Updated.'. (use alert)
                alert('Cart Updated.');
              });
            });
          });
        });
      });
  
      },
      index() {
        routes.catalog(true);
      }
    };
  
    document.querySelectorAll('script[type="text/x-template"]').forEach((el) => { templates[el.id] = el.innerText; });
    window.addEventListener('hashchange', () => invokeRoute(window.location.hash));
    window.addEventListener('popstate', (ev) => {
      if (ev.state) {
        document.title = ev.state.title;
        invokeRoute(ev.state.url);
      }
    });
    window.addEventListener('keyup', (ev) => {
      if (ev.key === 'Enter') {
        document.activeElement.click();
      }
    });
    invokeRoute(window.location.hash);
  }());