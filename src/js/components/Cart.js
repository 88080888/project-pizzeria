import {select,settings,classNames,templates} from './settings.js';
import utils from './utils.js';
import CartProduct from './CartProduct.js';

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

export default Cart;