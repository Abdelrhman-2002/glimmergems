import { useState, useContext, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard } from '@fortawesome/free-solid-svg-icons';
import { CartContext } from '../contexts/Cartcontext';
import { useAuth } from '../contexts/Authcontext'; // Use the hook instead
import { createPaymentIntent, confirmPayment, createOrder as apiCreateOrder } from '../services/api';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Load Stripe with the correct publishable key
const stripePromise = loadStripe('pk_test_51RNZ9MGghYFFzNF3Z7aFmRbbOoxRtxu2wCGXXKFeWc6SEqSLXiVigS33l3xW5kOrfKUIp9xmuRXexEh1S9EyE0t500vks3GYPM');

// Format price to show EGP currency
const formatPrice = (price) => {
  return `${parseFloat(price).toLocaleString('en-EG')} EGP`;
};

// Payment Form Component (separate component)
const PaymentForm = ({ totalAmount, onPaymentComplete, onPaymentError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentProcessed, setPaymentProcessed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || paymentProcessed) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Creating payment intent for amount:', totalAmount);
      // Step 1: Create payment intent on server
      const intentResponse = await createPaymentIntent(totalAmount);
      console.log('Payment intent response:', intentResponse);
      
      if (!intentResponse.success || !intentResponse.clientSecret) {
        throw new Error('Failed to create payment');
      }
      
      // Step 2: Confirm card payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        intentResponse.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        }
      );

      if (stripeError) {
        console.error('Stripe error:', stripeError);
        throw new Error(stripeError.message);
      }
      
      console.log('Payment intent confirmed:', paymentIntent);
      
      if (paymentIntent.status === 'succeeded') {
        // Mark payment as processed to prevent double submission
        setPaymentProcessed(true);
        
        // Step 3: Confirm payment on server
        const confirmResponse = await confirmPayment(paymentIntent.id);
        console.log('Confirm payment response:', confirmResponse);
        
        if (!confirmResponse.success) {
          throw new Error('Payment verification failed');
        }
        
        // Step 4: Tell parent component payment is complete
        console.log('Payment successful, calling onPaymentComplete with ID:', paymentIntent.id);
        onPaymentComplete(paymentIntent.id);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment processing failed');
      onPaymentError(err.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="mb-2">Card Details</label>
        <div className="p-3 border rounded">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
            disabled={paymentProcessed}
          />
        </div>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {paymentProcessed && <Alert variant="success">Payment successful! Processing your order...</Alert>}
      
      <Button
        type="submit"
        variant="primary"
        className="mt-3 w-100"
        disabled={!stripe || loading || paymentProcessed}
      >
        {loading ? 'Processing...' : `Complete Order • ${formatPrice(totalAmount)}`}
        <FontAwesomeIcon icon={faCreditCard} className="ms-2" />
      </Button>
    </Form>
  );
};

// Main Checkout Page
const CheckoutPage = () => {
  const { cartItems, getCartTotal, clearCart } = useContext(CartContext);
  const { currentUser: user } = useAuth(); // Use the hook
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    phone: '',
    payment_method: 'credit_card'
  });
  
  const [step, setStep] = useState(1); // Step 1: Shipping, Step 2: Payment
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [orderCreated, setOrderCreated] = useState(false);
  
  const subtotal = getCartTotal();
  // Update shipping threshold to 7,500 EGP (approximately $100 in EGP)
  const shipping = subtotal > 7500 ? 0 : 750;
  const taxRate = 0.01; // 1% tax
  const tax = subtotal * taxRate;
  const total = subtotal + shipping + tax;
  
  useEffect(() => {
    // Redirect to cart if no items
    if (cartItems.length === 0 && !orderCreated) {
      navigate('/cart');
    }
  }, [cartItems, navigate, orderCreated]);
  
  // Fill form with user data when user data becomes available
  useEffect(() => {
    if (user) {
      setFormData(prevData => ({
        ...prevData,
        first_name: user.first_name || prevData.first_name,
        last_name: user.last_name || prevData.last_name,
        email: user.email || prevData.email,
        address: user.address || prevData.address,
        city: user.city || prevData.city,
        state: user.state || prevData.state,
        zip_code: user.zip_code || prevData.zip_code,
        phone: user.phone || prevData.phone
      }));
    }
  }, [user]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmitShipping = (e) => {
    e.preventDefault();
    setError('');
    
    // Validate shipping fields
    if (!formData.first_name || !formData.last_name || !formData.email || 
        !formData.address || !formData.city || !formData.state || !formData.zip_code) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Move to payment step
    setStep(2);
  };
  
  const handlePaymentComplete = (paymentId) => {
    // Create order with completed payment
    console.log("Payment complete callback received with ID:", paymentId);
    createOrder(paymentId);
  };
  
  const handlePaymentError = (errorMessage) => {
    setPaymentError(errorMessage);
    window.scrollTo(0, 0); // Scroll to top to show error
  };
  
  const createOrder = async (paymentId = null) => {
    if (orderCreated) {
      console.log("Order already created, skipping");
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Prepare order data
      const orderData = {
        user_id: user?.user_id || null, // Handle null case explicitly
        items: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price
        })),
        shipping_address: {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email || '', // Ensure email is included
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code,
          phone: formData.phone || ''
        },
        // Both naming options for compatibility
        total_amount: total,
        total: total,
        subtotal: subtotal,
        shipping: shipping,
        tax: tax,
        payment_method: formData.payment_method || 'credit_card',
        payment_id: paymentId
      };
      
      // Log the order data for debugging
      console.log('Creating order with data:', JSON.stringify(orderData, null, 2));
      
      // Create order in database
      const response = await apiCreateOrder(orderData);
      console.log('Order creation response:', response);
      
      if (response.success) {
        // Mark order as created
        setOrderCreated(true);
        
        // Clear cart before redirecting
        clearCart();
        
        // Add a small delay to ensure state updates before redirect
        setTimeout(() => {
          console.log("Redirecting to order success page...");
          navigate('/order-success', { replace: true });
        }, 300);
      } else {
        throw new Error(response.message || 'Failed to create order');
      }
    } catch (err) {
      console.error('Order creation error details:', err);
      setError('Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // If redirecting after successful order, show loading
  if (orderCreated) {
    return (
      <Container className="py-5 text-center">
        <h2>Completing your order...</h2>
        <p>Please wait while we process your order.</p>
      </Container>
    );
  }
  
  // Redirect if no items in cart
  if (cartItems.length === 0 && !orderCreated) {
    return null; // We'll redirect in useEffect
  }
  
  return (
    <Container className="py-5">
      <h1 className="mb-4">Checkout</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Row>
        <Col lg={8}>
          {step === 1 ? (
            // Step 1: Shipping Address
            <Card className="mb-4">
              <Card.Header>
                <h4 className="mb-0">Shipping Information</h4>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleSubmitShipping}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>First Name <span className="text-danger">*</span></Form.Label>
                        <Form.Control 
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Last Name <span className="text-danger">*</span></Form.Label>
                        <Form.Control 
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                        <Form.Control 
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Phone</Form.Label>
                        <Form.Control 
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Address <span className="text-danger">*</span></Form.Label>
                    <Form.Control 
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  
                  <Row>
                    <Col md={5}>
                      <Form.Group className="mb-3">
                        <Form.Label>City <span className="text-danger">*</span></Form.Label>
                        <Form.Control 
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>State <span className="text-danger">*</span></Form.Label>
                        <Form.Control 
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>ZIP Code <span className="text-danger">*</span></Form.Label>
                        <Form.Control 
                          type="text"
                          name="zip_code"
                          value={formData.zip_code}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Button
                    type="submit"
                    variant="primary"
                    className="mt-3"
                  >
                    Continue to Payment
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          ) : (
            // Step 2: Payment
            <Card className="mb-4">
              <Card.Header>
                <h4 className="mb-0">Payment Information</h4>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-4">
                  <Form.Label>Payment Method</Form.Label>
                  <div>
                    <Form.Check
                      type="radio"
                      label="Credit Card"
                      name="payment_method"
                      id="credit_card"
                      value="credit_card"
                      checked={formData.payment_method === 'credit_card'}
                      onChange={handleChange}
                      className="mb-2"
                    />
                  </div>
                </Form.Group>
                
                {paymentError && <Alert variant="danger">{paymentError}</Alert>}
                
                <Elements stripe={stripePromise}>
                  <PaymentForm
                    totalAmount={total}
                    onPaymentComplete={handlePaymentComplete}
                    onPaymentError={handlePaymentError}
                  />
                </Elements>
                
                <div className="mt-3">
                  <Button
                    variant="outline-secondary"
                    onClick={() => setStep(1)}
                    className="me-2"
                    disabled={loading}
                  >
                    Back to Shipping
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
        
        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header>
              <h4 className="mb-0">Order Summary</h4>
            </Card.Header>
            <Card.Body>
              {/* Cart Items */}
              <div className="mb-3">
                {cartItems.map(item => (
                  <div key={item.product_id} className="d-flex justify-content-between mb-2">
                    <span>
                      {item.name} <span className="text-muted">x {item.quantity}</span>
                    </span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              
              <hr />
              
              {/* Order Totals */}
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping:</span>
                <span>
                  {shipping === 0 ? (
                    <span className="text-success">Free</span>
                  ) : (
                    formatPrice(shipping)
                  )}
                </span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Tax (1%):</span>
                <span>{formatPrice(tax)}</span>
              </div>
              
              <hr />
              
              <div className="d-flex justify-content-between mb-0">
                <strong>Total:</strong>
                <strong>{formatPrice(total)}</strong>
              </div>
              
              {shipping === 0 && (
                <Alert variant="success" className="mt-3 py-2">
                  <small className="mb-0">
                    <i className="fas fa-check-circle me-1"></i>
                    Free shipping applied! Orders over 7,500 EGP qualify for free shipping.
                  </small>
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CheckoutPage;