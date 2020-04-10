import {select, classNames} from '../settings.js';

class Carousel {
  constructor () {
    let slides = document.querySelectorAll(select.carousel.slides);
    let dots = document.querySelectorAll(select.carousel.dots);
    let currentSlide = 0;
    setInterval(nextSlide, 3000);

    function nextSlide() {
      slides[currentSlide].classList.remove(classNames.slides.active);
      dots[currentSlide].classList.remove(classNames.dots.active);

      currentSlide = (currentSlide + 1) % slides.length;

      slides[currentSlide].classList.add(classNames.slides.active);
      dots[currentSlide].classList.add(classNames.dots.active);
    }
  }
}

export default Carousel;