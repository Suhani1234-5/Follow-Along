// // OrderConfirmation.jsx
// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import NavBar from '../components/auth/nav';
// import { useLocation, useNavigate } from 'react-router-dom';
// // 1) Import PayPalScriptProvider & PayPalButtons
// import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

// const OrderConfirmation = () => {
//     const location = useLocation();
//     const navigate = useNavigate();
//     const { addressId, email } = location.state || {};
//     const [selectedAddress, setSelectedAddress] = useState(null);
//     const [cartItems, setCartItems] = useState([]);
//     const [totalPrice, setTotalPrice] = useState(0);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     // 2) Track which payment method is selected
//     const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' or 'paypal'

//     useEffect(() => {
//         if (!addressId || !email) {
//             navigate('/select-address'); // Redirect if no address selected or email missing
//             return;
//         }   
//         const fetchData = async () => {
//             try {
//                 // Fetch selected address
//                 const addressResponse = await axios.get('http://localhost:8000/api/v2/user/addresses', {
//                     params: { email: email },
//                 });
//                 if (addressResponse.status !== 200) {
//                     throw new Error(`Failed to fetch addresses. Status: ${addressResponse.status}`);
//                 }
//                 const addressData = addressResponse.data;
//                 const address = addressData.addresses.find(addr => addr._id === addressId);
//                 if (!address) {
//                     throw new Error('Selected address not found.'); 
//                 }
//                 setSelectedAddress(address);
//                 // Fetch cart products from /cartproducts endpoint
//                 const cartResponse = await axios.get('http://localhost:8000/api/v2/product/cartproducts', {
//                     params: { email: email },
//                 });
//                 if (cartResponse.status !== 200) {
//                     throw new Error(`Failed to fetch cart products. Status: ${cartResponse.status}`);
//                 }
//                 const cartData = cartResponse.data;
//                 // Map cart items to include full image URLs
//                 const processedCartItems = cartData.cart.map(item => ({
//                     product: item.productId._id,
//                     name: item.productId.name,
//                     price: item.productId.price,
//                     image: item.productId.images.map(imagePath => `http://localhost:8000${imagePath}`),
//                     quantity: item.quantity,
//                 }));
//                 setCartItems(processedCartItems);
//                 // Calculate total price
//                 const total = processedCartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
//                 setTotalPrice(total);
//             } catch (err) {
//                 console.error('Error fetching data:', err);
//                 setError(err.response?.data?.message || err.message || 'An unexpected error occurred.');
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchData();
//     }, [addressId, email, navigate]);

//     // 3) Single function to place order, can accept PayPal data if payment was online
//     const handlePlaceOrder = async (paymentType = 'cod', paypalOrderData = null) => {
//         try {
//             // setLoading(true);
//             // const response = await axios.post('http://localhost:8000/api/v2/orders/place-order', {
//             // Map cartItems to match the backend expected format
//             const orderItems = cartItems.map(item => ({
//                 product: item.product,
//                 name: item.name,
//                 quantity: item.quantity,
//                 price: item.price,
//                 image: item.images && item.images.length > 0 ? item.images[0] : '/default-avatar.png'
//             }));
//             // console.log(orderItems);
//             // Construct payload with paymentMethod and optional PayPal data
//             const payload = {
//                 email,
//                 shippingAddress: selectedAddress,
//                 orderItems,
//                 paymentMethod: paymentType, // 'cod' or 'paypal'
//                  // Optionally store PayPal transaction details:
//                 paypalOrderData,
//             };
//             // Send POST request to place orders
//             const response = await axios.post('http://localhost:8000/api/v2/orders/place-order', payload);
//             console.log('Orders placed successfully:', response.data);

//             // Navigate to an order success page or display a success message
//             navigate('/order-success'); // Adjust route as needed
//         } catch (error) {
//             console.error('Error placing order:', error);
//             // Optionally update error state to display an error message to the user
//         }
//     };
//     if (loading) {
//         return (
//             <div className='w-full h-screen flex justify-center items-center'>
//                 <p className='text-lg'>Processing...</p>
//             </div>
//         );
//     }
//     if (error) {
//         return (
//             <div className='w-full h-screen flex flex-col justify-center items-center'>
//                 <p className='text-red-500 text-lg mb-4'>Error: {error}</p>
//                 <button
//                     onClick={() => window.location.reload()}
//                     className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600'
//                 >
//                     Retry
//                 </button>
//             </div>
//         );
//     }
//     return (
//         <div className='w-full min-h-screen flex flex-col'>
//             <NavBar />
//             <div className='flex-grow flex justify-center items-start p-4'>
//                 <div className='w-full max-w-4xl border border-neutral-300 rounded-md flex flex-col p-6 bg-white shadow-md'>
//                     <h2 className='text-2xl font-semibold mb-6 text-center'>Order Confirmation</h2>
//                     {/* Selected Address */}
//                     <div className='mb-6'>
//                         <h3 className='text-xl font-medium mb-2'>Shipping Address</h3>
//                         {selectedAddress ? (
//                             <div className='p-4 border rounded-md'>
//                                 <p className='font-medium'>
//                                     {selectedAddress.address1}{selectedAddress.address2 ? `, ${selectedAddress.address2}` : ''}, {selectedAddress.city}, {selectedAddress.state}, {selectedAddress.zipCode}
//                                 </p>
//                                 <p className='text-sm text-gray-600'>{selectedAddress.country}</p>
//                                 <p className='text-sm text-gray-500'>Type: {selectedAddress.addressType || 'N/A'}</p>
//                             </div>
//                         ) : (
//                             <p>No address selected.</p>
//                         )}
//                     </div>
//                     {/* Cart Items */}
//                     <div className='mb-6'>
//                         <h3 className='text-xl font-medium mb-2'>Cart Items</h3>
//                         {cartItems.length > 0 ? (
//                             <div className='space-y-4'>
//                                 {cartItems.map((item) => (
//                                     <div key={item._id} className='flex justify-between items-center border p-4 rounded-md'>
//                                         <div className='flex items-center'>
//                                             <img
//                                                 src={item.image && item.image.length > 0 ? item.image[0] : '/default-avatar.png'} // Use first image or fallback
//                                                 alt={item.name}
//                                                 className='w-16 h-16 object-cover rounded-md mr-4'
//                                             />
//                                             <div>
//                                                 <p className='font-medium'>{item.name}</p>
//                                                 <p className='text-sm text-gray-600'>Quantity: {item.quantity}</p>
//                                                 <p className='text-sm text-gray-600'>Price: ${item.price.toFixed(2)}</p>
//                                             </div>
//                                         </div>
//                                         <div>
//                                             <p className='font-semibold'>${(item.price * item.quantity).toFixed(2)}</p>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         ) : (
//                             <p>Your cart is empty.</p>
//                         )}
//                     </div>
//                     {/* Total Price */}
//                     <div className='mb-6 flex justify-end'>
//                         <p className='text-xl font-semibold'>Total: ${totalPrice.toFixed(2)}</p>
//                     </div>
//                     {/* Payment Method (Cash on Delivery or PayPal) */}
//                     <div className='mb-6'>
//                         <h3 className='text-xl font-medium mb-2'>Payment Method</h3>
//                         <div className='p-4 border rounded-md space-x-4'>
//                              <label className='mr-4'>
//                                  <input
//                                      type='radio'
//                                      name='paymentMethod'
//                                      value='cod'
//                                      checked={paymentMethod === 'cod'}
//                                      onChange={() => setPaymentMethod('cod')}
//                                  />
//                                  <span className='ml-2'>Cash on Delivery</span>
//                              </label>
//                              <label>
//                                  <input
//                                      type='radio'
//                                      name='paymentMethod'
//                                      value='paypal'
//                                      checked={paymentMethod === 'paypal'}
//                                      onChange={() => setPaymentMethod('paypal')}
//                                  />
//                                  <span className='ml-2'>Pay Online (PayPal)</span>
//                              </label>
//                         </div>
//                         {paymentMethod === 'paypal' && (
//                              <div className='mt-4' style={{ maxWidth: '500px' }}>
//                                  <PayPalScriptProvider
//                                      options={{
//                                          'client-id': "AYEJV5UU0FVARydTYcvsaga7Z6PKkwq5T6yFT7k4-49C8qhHNHOImv9EYElHeDb2LXC60tb8Wya-Jkcc", 
//                                      }}
//                                  >
//                                      <PayPalButtons
//                                          style={{ layout: 'vertical' }}
//                                          createOrder={(data, actions) => {
//                                              return actions.order.create({
//                                                  purchase_units: [
//                                                      {
//                                                          amount: {
//                                                              value: totalPrice.toFixed(2),
//                                                          },
//                                                      },
//                                                  ],
//                                              });
//                                          }}
//                                          onApprove={async (data, actions) => {
//                                              // Captures funds from the transaction
//                                              const order = await actions.order.capture();
//                                              console.log('PayPal order success:', order);
 
//                                              // Call place order with PayPal data
//                                              handlePlaceOrder('paypal', order);
//                                          }}
//                                          onError={(err) => {
//                                              console.error('PayPal checkout error:', err);
//                                          }}
//                                      />
//                                  </PayPalScriptProvider>
//                              </div>
//                          )}
//                     </div>
//                     {/* Place Order Button (for COD) */}
//                     {paymentMethod === 'cod' && (
//                          <div className='flex justify-center'>
//                              <button
//                                  onClick={() => handlePlaceOrder('cod', null)}
//                                  className='bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition-colors'
//                              >
//                                  Place Order
//                              </button>
//                          </div>
//                      )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default OrderConfirmation;
// OrderConfirmation.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import NavBar from '../components/auth/nav';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51Reyig2Nxpt61C3QmHpSrOTsETFGcVq69CYrKUHNcp88gSEafZBK4ClbuX9JkddwHyOwY6dXkSza6LeH7A1CzzKd00FxbftGqw');

const OrderConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { addressId, email } = location.state || {};
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('cod');

    useEffect(() => {
        if (!addressId || !email) {
            navigate('/select-address');
            return;
        }
        const fetchData = async () => {
            try {
                const addressResponse = await axios.get('http://localhost:8000/api/v2/user/addresses', {
                    params: { email },
                });
                const addressData = addressResponse.data;
                const address = addressData.addresses.find(addr => addr._id === addressId);
                if (!address) throw new Error('Selected address not found.');
                setSelectedAddress(address);

                const cartResponse = await axios.get('http://localhost:8000/api/v2/product/cartproducts', {
                    params: { email },
                });
                const cartData = cartResponse.data;
                const processedCartItems = cartData.cart.map(item => ({
                    product: item.productId._id,
                    name: item.productId.name,
                    price: item.productId.price,
                    image: item.productId.images.map(img => `http://localhost:8000${img}`),
                    quantity: item.quantity,
                }));
                setCartItems(processedCartItems);
                const total = processedCartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
                setTotalPrice(total);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [addressId, email, navigate]);

    const handlePlaceOrder = async (paymentType = 'cod') => {
        try {
            const orderItems = cartItems.map(item => ({
                product: item.product,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                image: item.image?.[0] || '/default-avatar.png'
            }));

            const payload = {
                email,
                shippingAddress: selectedAddress,
                orderItems,
                paymentMethod,
            };

            const response = await axios.post('http://localhost:8000/api/v2/orders/place-order', payload);
            navigate('/order-success');
        } catch (error) {
            console.error('Error placing order:', error);
        }
    };

    const handleStripeCheckout = async () => {
        try {
            const stripe = await stripePromise;
            const orderItems = cartItems.map(item => ({
                name: item.name,
                price: item.price,
                quantity: item.quantity,
            }));
            const sessionResponse = await axios.post('http://localhost:8000/api/v2/orders/create-stripe-session', {
                items: orderItems,
                email,
                address: selectedAddress,
            });
            await stripe.redirectToCheckout({ sessionId: sessionResponse.data.id });
        } catch (err) {
            console.error('Stripe checkout error:', err);
        }
    };

    if (loading) return <div className='w-full h-screen flex justify-center items-center'><p className='text-lg'>Processing...</p></div>;
    if (error) return <div className='w-full h-screen flex flex-col justify-center items-center'><p className='text-red-500 text-lg mb-4'>Error: {error}</p><button onClick={() => window.location.reload()} className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600'>Retry</button></div>;

    return (
        <div className='w-full min-h-screen flex flex-col'>
            <NavBar />
            <div className='flex-grow flex justify-center items-start p-4'>
                <div className='w-full max-w-4xl border border-neutral-300 rounded-md flex flex-col p-6 bg-white shadow-md'>
                    <h2 className='text-2xl font-semibold mb-6 text-center'>Order Confirmation</h2>

                    <div className='mb-6'>
                        <h3 className='text-xl font-medium mb-2'>Shipping Address</h3>
                        {selectedAddress && (
                            <div className='p-4 border rounded-md'>
                                <p>{selectedAddress.address1}, {selectedAddress.city}, {selectedAddress.state}, {selectedAddress.zipCode}</p>
                                <p className='text-sm text-gray-600'>{selectedAddress.country}</p>
                                <p className='text-sm text-gray-500'>Type: {selectedAddress.addressType || 'N/A'}</p>
                            </div>
                        )}
                    </div>

                    <div className='mb-6'>
                        <h3 className='text-xl font-medium mb-2'>Cart Items</h3>
                        <div className='space-y-4'>
                            {cartItems.map((item, i) => (
                                <div key={i} className='flex justify-between items-center border p-4 rounded-md'>
                                    <div className='flex items-center'>
                                        <img src={item.image?.[0] || '/default-avatar.png'} alt={item.name} className='w-16 h-16 object-cover rounded-md mr-4' />
                                        <div>
                                            <p>{item.name}</p>
                                            <p className='text-sm text-gray-600'>Qty: {item.quantity}</p>
                                            <p className='text-sm text-gray-600'>Price: ${item.price.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <p className='font-semibold'>${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className='mb-6 flex justify-end'>
                        <p className='text-xl font-semibold'>Total: ${totalPrice.toFixed(2)}</p>
                    </div>

                    <div className='mb-6'>
                        <h3 className='text-xl font-medium mb-2'>Payment Method</h3>
                        <div className='p-4 border rounded-md space-x-4'>
                            <label className='mr-4'>
                                <input type='radio' name='paymentMethod' value='cod' checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                                <span className='ml-2'>Cash on Delivery</span>
                            </label>
                            <label>
                                <input type='radio' name='paymentMethod' value='stripe' checked={paymentMethod === 'stripe'} onChange={() => setPaymentMethod('stripe')} />
                                <span className='ml-2'>Pay Online (Stripe)</span>
                            </label>
                        </div>
                    </div>

                    {paymentMethod === 'cod' && (
                        <div className='flex justify-center'>
                            <button onClick={() => handlePlaceOrder('cod')} className='bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition-colors'>Place Order</button>
                        </div>
                    )}

                    {paymentMethod === 'stripe' && (
                        <div className='flex justify-center'>
                            <button onClick={handleStripeCheckout} className='bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition-colors'>Pay with Stripe</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;
