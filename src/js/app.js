import {settings, select, classNames} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';

const app = {
  initPages: function(){
    const thisApp = this;
    //przechowyjemy wszystkie kontenery podstron ktore musimy wyszukac w drzewie dom / dzięki children we wlasciwosci pages znajda sie wszystkie dzieci kontenera stron
    thisApp.pages = document.querySelector(select.containerOf.pages).children;

    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    const idFromHash = window.location.hash.replace('#/','');
   
    //aktywacja pierwszej podstony
    let pageMatchingHash = thisApp.pages[0].id;

    for(let page of thisApp.pages){
      if(page.id == idFromHash){
        pageMatchingHash = page.id;
        break;
      }
    }

    thisApp.activatePage(pageMatchingHash);

    for(let link of thisApp.navLinks){
      link.addEventListener('click',function(event){
        const clickedElement = this;
        event.preventDefault();

        /*get page id from href atribute */
        // w stalej id zapisuje atrybut href kliknietego elementu w ktorym zamieniam znak # na pusty ciag znakow
        const id = clickedElement.getAttribute('href').replace('#','');

        /* run thisApp.activatePage with that id*/
        thisApp.activatePage(id);

        /*change URL hash*/
        window.location.hash = '#/' + id;

      });
    }
  },

  //nadanie klasy active  wrapperowi pages i booking
  activatePage: function(pageId){
    const thisApp = this;

    /*add class "active" to matching pages, remove from non-matching*/
    for(let page of thisApp.pages){
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }

    /*add class "active" to matching links, remove from non-matching*/
    //dla kazdego z linkow zapisanych w thisApp.navLinks  dodaj lub usuń klasę zdefiniowaną w classNames.nav.active  i w zaleznosci od tego czy atrybut href tego linka jest rowny # + pageId
    for(let link of thisApp.navLinks){
      link.classList.toggle(
        classNames.nav.active, 
        link.getAttribute('href') == '#' + pageId
      );
    }
  },

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
        //console.log('parasedResponse', parsedResponse);

        /*save parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedResponse;

        /* execute initMenu method */
        thisApp.initMenu();
      });
    //console.log('thisApp.data', JSON.stringify(thisApp.data));    
  },

  //inicjuje instancję koszyka
  initCart: function(){
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function(event) {
      app.cart.add(event.detail.product);
    });
  },

  initBooking(){
    const thisApp = this;

    const bookingWrapper = document.querySelector(select.containerOf.booking);
    thisApp.booking = new Booking(bookingWrapper);
  },

  init: function(){
    const thisApp = this;
    //console.log('*** App starting ***');
    //console.log('thisApp:', thisApp);
    //console.log('classNames:', classNames);
    //console.log('settings:', settings);
    //console.log('templates:', templates);

    thisApp.initPages();
    thisApp.initData();
    //thisApp.initMenu();
    thisApp.initCart();
    thisApp.initBooking();
  },

};
  
app.init();

