import {settings, select} from './settings.js';
import Product from './components/Product.js';
import Cart from '.components/Cart.js';

const app = {
  initMenu(){
    const thisApp = this;
    //console.log('thisApp.data:', thisApp.data);
    for(let productData in thisApp.data.products){
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initData: function(){
    const thisApp = this;

    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.product;

    // za pomocą funkcji fetch wysyłamy zapytanie pod podany adres endpointu
    fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
    // otrzymaną odpowiedź konwertujemy z JSONa na tablicę
      .then(function(parsedResponse){
        console.log('parasedResponse', parsedResponse);

        /*save parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedResponse;

        /* execute initMenu method */
        thisApp.initMenu();
      });
    console.log('thisApp.data', JSON.stringify(thisApp.data));    
  },

  //inicjuje instancję koszyka
  initCart: function(){
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.adddEventListener('add-to-cart',function(event){
      app.cart.add(event.detaiil.product);
    });
  },
  
  init: function(){
    const thisApp = this;
    //console.log('*** App starting ***');
    //console.log('thisApp:', thisApp);
    //console.log('classNames:', classNames);
    //console.log('settings:', settings);
    //console.log('templates:', templates);

    thisApp.initData();
    //thisApp.initMenu();
    thisApp.initCart();
  },
};
  
app.init();

