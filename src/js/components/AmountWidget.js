import {select,settings} from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget{
  constructor(element){
    //odwołanie do konstruktora klasy nadrzednej BaseWidget, ma 2 argumenty: element przekazany konstruktorowu Amount Widget i poczatkowa wartosc widhetu
    super(element, settings.amountWidget.defaultValue);

    const thisWidget = this;

    thisWidget.getElements(element);

    thisWidget.initActions();

    //console.log('AmountWidget:', thisWidget);
    //console.log('constructor arguments:', element);

  }

  getElements(){
    const thisWidget = this;
      
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }


  //zwraca true lub false w zaleznosci od tego czy wartosc ktora chcemy ustawic dla tego widgetu jest prawidlowa wg kryteriow ktore sa ustawione dla kazdego widgetu
  isValid(value){
    return !isNaN(value)
      && value >= settings.amountWidget.defaultMin 
      && value <=  settings.amountWidget.defaultMax;
  }

  //aby biezaca wartosc widgetu zostala wyswietlona na stronie
  renderValue(){
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;
  }

  initActions(){
    const thisWidget = this;

    thisWidget.dom.input.addEventListener('change',function() {
      thisWidget.setValue(thisWidget.dom.input.value);
    });
    thisWidget.dom.linkDecrease.addEventListener('click',function() {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value-1);
    });
    thisWidget.dom.linkIncrease.addEventListener('click',function() {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value+1);
    });
  }
}

export default AmountWidget;