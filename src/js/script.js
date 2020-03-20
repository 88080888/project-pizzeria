/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';
  //selektory
  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };

  //nazwy klas
  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };

  //ustawienia skryptu
  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END

    db: {
      url: '//localhost:3131',
      product: 'product',
      order: 'order',
    },
  };

  //szablony handlebars do ktorych wykorzystujemy selektory z obiektu select
  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };
  
  class Product{
    constructor(id, data){
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();

      //console.log('new Product:', thisProduct);
    }
    renderInMenu(){
      const thisProduct = this;
      /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);

      /* create element using utils.createElemetFromHTML */
      //tworzenie elementu DOM
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);

      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);

      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
    }

    getElements(){
      const thisProduct = this;
    
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordion(){
      const thisProduct = this;
  
      /* find the clickable trigger (the element that should react to clicking) */
      const clickableTrigger = thisProduct.accordionTrigger;
      
  
      /* START: click event listener to trigger */
      clickableTrigger.addEventListener('click', function() {
  
        /* prevent default action for event */
        event.preventDefault();
  
        /* toggle active class on element of thisProduct */
        thisProduct.element.classList.toggle('active');
  
        /* find all active products */
        const allActiveProducts = document.querySelectorAll('article.active');
        
        /* START LOOP: for each active product */
        for (let activeProduct of allActiveProducts ) {
          /* START: if the active product isn't the element of thisProduct */
          
          if (activeProduct !== thisProduct.element) {
            /* remove class active for the active product */
            activeProduct.classList.remove('active');
          
          /* END: if the active product isn't the element of thisProduct */
          }
        /* END LOOP: for each active product */  
        }
      /* END: click event listener to trigger */
      });
    }

    initOrderForm(){
      const thisProduct = this;

      thisProduct.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });

      for (let input of thisProduct.formInputs){
        input.addEventListener('change', function () {
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function (event){
        event.preventDefault();
        thisProduct.addToCart();
        thisProduct.processOrder();
      });
    }

    processOrder(){
      const thisProduct = this;

      /* read all data from the form (using utils.serializeFormToObject) and save it to const formData */
      const formData = utils.serializeFormToObject(thisProduct.form);

      /* set variable price to equal thisProduct.data.price */
      thisProduct.params = {};
      let price = thisProduct.data.price;
      const params = thisProduct.data.params;

      /* START LOOP: for each paramId in thisProduct.data.params */
      for (let paramId in params){

        /* save the element in thisProduct.data.params with key paramId as const param */
        const param = params[paramId];

        /* START LOOP: for each optionId in param.options */
        for (let optionId in param.options){

          /* save the element in param.options with key optionId as const option */
          const option = param.options[optionId];

          /* START IF: if option is selected and option is not default */
          const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
          //console.log('optionselected',optionSelected);
          if (optionSelected && !option.default){
            /* add price of option to variable price */
            price += option.price;

          /* END IF: if option is selected and option is not default */
          /* START ELSE IF: if option is not selected and option is default */
          } else if (!optionSelected && option.default) {
            /* deduct price of option from price */
            price -= option.price;

            //console.log('price::',price);
          }
          /* END ELSE IF: if option is not selected and option is default */

          const selectedImg = thisProduct.imageWrapper.querySelectorAll(`.${paramId}-${optionId}`);
          if (optionSelected) {

            if(!thisProduct.params[paramId]){
              thisProduct.params[paramId] = {
                label: param.label,
                options: {},
              };
            }

            thisProduct.params[paramId].options[optionId] = option.label;

            for (let image of selectedImg) {
              image.classList.add(classNames.menuProduct.imageVisible);
            }

          } else {
            for (let image of selectedImg) {
              image.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
        //console.log('thisProductparams',thisProduct.params);
        /* END LOOP: for each optionId in param.options */
      }
      /* END LOOP: for each paramId in thisProduct.data.params */

      /*multiply price by account */
      //price *= thisProduct.amountWidget.value;
      thisProduct.priceSingle = price;
      thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
      /* set the contents of thisProduct.priceElem to be the value of variable price */
      thisProduct.priceElem.innerHTML = thisProduct.price;
    }

    initAmountWidget(){
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated',function(){
        thisProduct.processOrder();
      });     
    }

    addToCart(){
      const thisProduct = this;

      thisProduct.name = thisProduct.data.name;
      thisProduct.amount = thisProduct.amountWidget.value;

      app.cart.add(thisProduct);
    }
  }

  class AmountWidget{
    constructor(element){
      const thisWidget = this;
      thisWidget.getElements(element);
      thisWidget.value = settings.amountWidget.defaultValue;
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();

      //console.log('AmountWidget:', thisWidget);
      //console.log('constructor arguments:', element);
    }

    getElements(element){
      const thisWidget = this;
      
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value){
      const thisWidget = this;
      const newValue = parseInt(value);

      //add validation
      if (newValue != thisWidget.value && newValue >= settings.amountWidget.defaultMin && newValue <=  settings.amountWidget.defaultMax) {
        thisWidget.value = newValue;
        thisWidget.announce();
      } 

      thisWidget.input.value = thisWidget.value;
    }

    initActions(){
      const thisWidget = this;

      thisWidget.input.addEventListener('change',function() {
        thisWidget.setValue(thisWidget.input.value);
      });
      thisWidget.linkDecrease.addEventListener('click',function() {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value-1);
      });
      thisWidget.linkIncrease.addEventListener('click',function() {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value+1);
      });
    }

    announce() {
      const thisWidget = this;

      const event = new CustomEvent('updated',{
        bubbles: true
      });
      thisWidget.element.dispatchEvent(event);
    }
  }

  class Cart{
    constructor(element){
      const thisCart = this;

      thisCart.products = [];

      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;

      thisCart.getElements(element);
      thisCart.initActions();

      // console.log('new Cart', thisCart);
    }

    getElements(element){
      const thisCart = this;

      thisCart.dom = {};
      
      thisCart.dom.wrapper = element;

      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);

      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);

      thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);

      thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);

      thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.adress);

      thisCart.renderTotalKeys = ['totalNumber','totalPrice','subtotalPrice','deliverFee'];
      for(let key of thisCart.renderTotalKeys){
        thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
      }

      
    }

    initActions(){
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function(){
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });

      thisCart.dom.productList.addEventListener('updated',function(){
        thisCart.update();
      });

      thisCart.dom.productList.addEventListener('remove',function(){
        thisCart.remove(event.detail.cartProduct);
      });

      thisCart.dom.form.addEventListener('submit', function(){
        event.preventDefault();
        thisCart.sendOrder();
      });


    }

    add(menuProduct){
      const thisCart = this;

      //tworzę kod HTML
      const generatedHTML = templates.cartProduct(menuProduct);

      //tworzę elemety DOM z kodu HTML
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);

      //do thisCart.dom.productList dodaję elementy DOM
      thisCart.dom.productList.appendChild(generatedDOM);

      //tworze nowa instacje klacy Cartproduct i dodaję ją do tablicy thisCart.products
      thisCart.products.push(new CartProduct(menuProduct,generatedDOM));

      //console.log('addingproduct:', menuProduct);

      thisCart.update();
    }

    update(){
      const thisCart = this;
      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;

      

      for (let product of thisCart.products) {
        thisCart.subtotalPrice += product.price;
        thisCart.totalNumber += product.amount;

      }

      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;

      //console.log('totalnumber', thisCart.totalNumber);
      //console.log('subtotalprice', thisCart.subtotalPrice);
      //console.log('thiscarttotalprice', thisCart.totalPrice);

      for(let key of thisCart.renderTotalKeys){
        for(let elem of thisCart.dom[key]){
          elem.innerHTML = thisCart[key];
        }
      }

    }

    remove(cartProduct){
      const thisCart = this;

      const index = thisCart.products.indexOf(cartProduct);

      thisCart.products.splice(index,1);

      cartProduct.dom.wrapper.remove();

      thisCart.update();
    }

    sendOrder(){
      const thisCart = this;
      // w stałej url umieszczamy adres endpointu
      const url = settings.db.url + '/' + settings.db.order;

      thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone).value;
      thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address).value;

      // deklarujemy stałą payload, czyli ładunek
      const payload = {
        address: thisCart.dom.address,
        phone: thisCart.dom.phone,
        totalPrice: thisCart.totalPrice,
        totalNumber: thisCart.totalNumber,
        subtotalPrice: thisCart.subtotalPrice,
        deliverFee: thisCart.deliverFee,
        products: []
      };

      for(let product of thisCart.products){
        product.getData();
        payload.products.push(product);
      }

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        //Używamy metody JSON.stringify, aby przekonwertować obiekt payload na ciąg znaków w formacie JSON
        body: JSON.stringify(payload),
      };

      fetch(url,options)
        .then(function(response){
          return response.json();
        })
        .then(function(parasedResponse){
          console.log('parasedResponse',parasedResponse);
        });      
    }

  }

  class CartProduct {

    constructor(menuProduct, element){
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.amount = menuProduct.amount;

      thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();


      //console.log('newwcartproduct:', thisCartProduct);
      //console.log('productdata', menuProduct);
    }

    getElements(element){
      
      const thisCartProduct = this;

      thisCartProduct.dom = {};

      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = element.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = element.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = element.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = element.querySelector(select.cartProduct.remove);
    }

    initAmountWidget(){
      const thisCartProduct = this;
 
      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);

      thisCartProduct.dom.amountWidget.addEventListener('updated',function() {

        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;

        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });     
    }

    remove(){
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },       
      });
      thisCartProduct.dom.wrapper.dispatchEvent(event);
    }

    initActions(){
      const thisCartProduct = this;
      
      thisCartProduct.dom.edit.addEventListener('click',function(){
        event.preventDefault();
      });
      thisCartProduct.dom.remove.addEventListener('click',function(){
        event.preventDefault();
        thisCartProduct.remove();
      });

    }

    getData(){
      const thisCartProduct = this;

      const product = {
        id: thisCartProduct.id,
        name: thisCartProduct.name,
        price: thisCartProduct.price,
        priceSingle: thisCartProduct.priceSingle,
        amount: thisCartProduct.amount,
        params: thisCartProduct.params ,
      };
      return product;
    }
  }


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
}
