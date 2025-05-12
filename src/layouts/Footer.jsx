import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faInstagram, faTwitter, faPinterest } from '@fortawesome/free-brands-svg-icons';
import { faMapMarkerAlt, faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-4 mt-5">
      <Container>
        <Row>
          <Col md={4}>
            <h5>GlimmerGems</h5>
            <p>Your premier destination for fine jewelry. We offer exquisite jewelry pieces crafted with precision and passion.</p>
            <div className="social-icons">
              <a href="#" className="text-white me-3"><FontAwesomeIcon icon={faFacebookF} /></a>
              <a href="#" className="text-white me-3"><FontAwesomeIcon icon={faInstagram} /></a>
              <a href="#" className="text-white me-3"><FontAwesomeIcon icon={faTwitter} /></a>
              <a href="#" className="text-white"><FontAwesomeIcon icon={faPinterest} /></a>
            </div>
          </Col>
          <Col md={4}>
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><Link to="/products" className="text-white">All Jewelry</Link></li>
              <li><Link to="/products?category=1" className="text-white">Rings</Link></li>
              <li><Link to="/products?category=2" className="text-white">Necklaces</Link></li>
              <li><Link to="/products?category=3" className="text-white">Earrings</Link></li>
              <li><Link to="/products?category=4" className="text-white">Bracelets</Link></li>
            </ul>
          </Col>
          <Col md={4}>
            <h5>Contact Us</h5>
            <address>
              <p><FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" /> 123 Jewelry Lane, Diamond City</p>
              <p><FontAwesomeIcon icon={faPhone} className="me-2" /> (123) 456-7890</p>
              <p><FontAwesomeIcon icon={faEnvelope} className="me-2" /> info@glimmergems.com</p>
            </address>
          </Col>
        </Row>
        <hr />
        <Row>
          <Col className="text-center">
            <p className="mb-0">&copy; {new Date().getFullYear()} GlimmerGems. All Rights Reserved.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;