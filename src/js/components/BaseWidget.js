class BaseWidget{
  constructor(wrapperElement, initialValue){
    const thisWidget = this;

    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;

    thisWidget.correctValue = initialValue;
  }

  // getter - metoda wykonywana przy kazdej probie odczytania wartosci wlasciwosci value
  get value(){
    const thisWidget = this;

    return thisWidget.correctValue;
  }
  
  // setter - metoda wykonywana przy kazdej probie ustawiania warosci wlasciwosci value
  set value(value){
    const thisWidget = this;
    const newValue = thisWidget.parseValue(value);

    //add validation
    if (newValue != thisWidget.correctValue && thisWidget.isValid(newValue)) {
      thisWidget.correctValue = newValue;
      thisWidget.announce();
    } 
    thisWidget.renderValue();
  }

  setValue(value){
    const thisWidget = this;

    thisWidget.value = value;
  }

  //przeksztalca wartosc ktora chcemy ustawić na odpowieni typ lub formę
  parseValue(value){
    return parseInt(value);
  }
    
  //zwraca true lub false w zaleznosci od tego czy wartosc ktora chcemy ustawic dla tego widgetu jest prawidlowa wg kryteriow ktore sa ustawione dla kazdego widgetu
  isValid(value){
    return !isNaN(value);
  }

  //aby biezaca wartosc widgetu zostala wyswietlona na stronie
  renderValue(){
    const thisWidget = this;
    
    thisWidget.dom.wrapper.innerHTML = thisWidget.value;
  }

  announce() {
    const thisWidget = this;

    const event = new CustomEvent('updated',{
      bubbles: true
    });
    thisWidget.dom.wrapper.dispatchEvent(event);
  }
}

export default BaseWidget;