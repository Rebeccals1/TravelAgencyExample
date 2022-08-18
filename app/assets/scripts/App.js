import '../styles/styles.css';
import MobileMenu from './modules/mobileMenu';
import RevealOnScroll from './modules/RevealOnScroll';
import StickyHeader from './modules/StickyHeader';

let stickyHeader = new StickyHeader();
new RevealOnScroll(".feature-item", 75);
new RevealOnScroll(".testimonial", 80);
let mobileMenu = new MobileMenu();


if (module.hot) {
    module.hot.accept();
}


