import React, { useContext, useEffect, useState, useRef } from 'react'
import { AppContext } from '../context/AppContext'
import {toast} from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MyAppointments = () => {

  const { backendUrl, token, getDoctorsData, stripePublicKey } = useContext(AppContext)

  const [appointments, setAppointments] = useState([])

  const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const navigate = useNavigate()

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split('_')

    return dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2]
  }

  const getUserAppointments = async () => {
    try {
      const {data} = await axios.get(backendUrl + '/api/user/appointments', {
        headers: {token}
      })
      if(data.success){
        setAppointments(data.appointments.reverse())
        console.log(data.appointments);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message)

    }
  }


  const cancelAppointment = async (appointmentId) => {
    try {
      // console.log(appointmentId);
      const {data} = await axios.post(backendUrl + '/api/user/cancel-appointment', {
        appointmentId
      }, {
        headers: {token}
      })
      if(data.success){
        toast.success(data.message)
        getUserAppointments()
        getDoctorsData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message)
    }
  }


  const [paymentState, setPaymentState] = useState({ loading: false, activeAppointmentId: null, showPaymentModal: false, selectedAppointmentId: null })
  const stripe = useRef(null)
  const cardElement = useRef(null)

  useEffect(() => {
    // Load Stripe.js from CDN
    const script = document.createElement('script')
    script.src = 'https://js.stripe.com/v3/'
    script.async = true
    script.onload = () => {
      // Initialize Stripe with your publishable key
      if (stripePublicKey) {
        stripe.current = window.Stripe(stripePublicKey)
      }
    }
    document.body.appendChild(script)
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [stripePublicKey])

  const appointmentpayment = async (appointmentId) => {
    try {
      setPaymentState({ 
        loading: true, 
        activeAppointmentId: appointmentId,
        showPaymentModal: true,
        selectedAppointmentId: appointmentId
      })
      
      // Call backend to create Stripe Payment Intent
      const { data } = await axios.post(
        backendUrl + '/api/user/appointment-payment',
        { appointmentId },
        { headers: { token } }
      )
      
      if (!data.success) {
        toast.error(data.message || 'Failed to initialize payment')
        setPaymentState({ loading: false, activeAppointmentId: null, showPaymentModal: false, selectedAppointmentId: null })
        return
      }

      // Store the client secret for later use
      setPaymentState(prev => ({ 
        ...prev, 
        loading: false,
        clientSecret: data.clientSecret,
        paymentIntentId: data.paymentIntentId
      }))
      
      toast.info('Please use test card: 4242 4242 4242 4242, any future expiry, any CVC')
      
    } catch (error) {
      console.log(error)
      toast.error(error.message || 'Payment error')
      setPaymentState({ loading: false, activeAppointmentId: null, showPaymentModal: false, selectedAppointmentId: null })
    }
  }

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (!stripe.current || !paymentState.clientSecret) {
        toast.error('Payment system not ready')
        return
      }

      setPaymentState(prev => ({ ...prev, loading: true }))

      // Get card details from form
      const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '')
      const cardExpiry = document.getElementById('cardExpiry').value
      const cardCvc = document.getElementById('cardCvc').value

      if (!cardNumber || !cardExpiry || !cardCvc) {
        toast.error('Please enter all card details')
        setPaymentState(prev => ({ ...prev, loading: false }))
        return
      }

      // Validate card format
      if (cardNumber.length < 13 || cardNumber.length > 19) {
        toast.error('Invalid card number')
        setPaymentState(prev => ({ ...prev, loading: false }))
        return
      }

      // Use Stripe test token for payment confirmation
      // For production, integrate with Stripe Elements
      const result = await stripe.current.confirmCardPayment(paymentState.clientSecret, {
        payment_method: {
          type: 'card',
          card: {
            token: 'tok_visa' // Use test token
          }
        }
      })

      if (result.error) {
        toast.error(result.error.message)
        setPaymentState(prev => ({ ...prev, loading: false }))
      } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        // Verify payment with backend
        const { data: verifyData } = await axios.post(
          backendUrl + '/api/user/verify-payment',
          { paymentIntentId: result.paymentIntent.id },
          { headers: { token } }
        )
        
        if (verifyData.success) {
          toast.success('Payment successful!')
          await getUserAppointments()
          setPaymentState({ loading: false, activeAppointmentId: null, showPaymentModal: false, selectedAppointmentId: null })
          navigate('/my-appointments')
        } else {
          toast.error(verifyData.message || 'Payment verification failed')
          setPaymentState({ loading: false, activeAppointmentId: null, showPaymentModal: false, selectedAppointmentId: null })
        }
      } else {
        toast.error('Payment could not be completed')
        setPaymentState({ loading: false, activeAppointmentId: null, showPaymentModal: false, selectedAppointmentId: null })
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message || 'Payment error')
      setPaymentState(prev => ({ ...prev, loading: false }))
    }
  }

  const closePaymentModal = () => {
    setPaymentState({ loading: false, activeAppointmentId: null, showPaymentModal: false, selectedAppointmentId: null })
  }

  useEffect(() => {
    if (token) {
      getUserAppointments()
    }
  }, [token])

  return (
    <div>
      <p className='pb-3 mt-12 font-medium text-zinc-700 border-b'>My appointments</p>
      <div>
        {appointments.map((item, index) => (
          <div className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b' key={index}>
            <div>
              <img className='w-32 bg-indigo-50' src={item.docData.image} alt="" />
            </div>
            <div className='flex-1 text-sm text-zinc-600'>
              <p className='text-neutral-800 font-semibold'>{item.docData.name}</p>
              <p>{item.docData.speciality}</p>
              <p className='text-zinc-700 font-medium mt-1'>Address:</p>
              <p className='text-xs'>{item.docData.address.line1}</p>
              <p className='text-xs'>{item.docData.address.line2}</p>
              <p className='text-xs mt-2'><span className='text-sm text-neutral-700 font-medium'>Date & Time:</span> {slotDateFormat(item.slotDate)} | {item.slotTime}</p>
            </div>
            <div></div>
            <div className='flex flex-col gap-2 justify-end'>
              {!item.cancelled && item.payment && <button className='sm:min-w-48 py- border rounded text-stone-500 bg-indigo-50'>Paid</button>}
              {!item.cancelled && !item.payment && (
                <button 
                  onClick={()=>appointmentpayment(item._id)} 
                  disabled={paymentState.loading && paymentState.activeAppointmentId === item._id}
                  className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'>
                  {paymentState.loading && paymentState.activeAppointmentId === item._id ? 'Processing...' : 'Pay Online'}
                </button>
              )}
              {!item.cancelled && (
                <button className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300' onClick={() => cancelAppointment(item._id)}>Cancel Appointment</button>
              )}
              {item.cancelled && (
                <button className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500'>Appointment Canceled</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {paymentState.showPaymentModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-semibold'>Payment Details</h2>
              <button onClick={closePaymentModal} className='text-gray-500 hover:text-gray-700'>✕</button>
            </div>
            
            <form onSubmit={handlePaymentSubmit} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Card Number</label>
                <input 
                  id='cardNumber'
                  type='text' 
                  placeholder='4242 4242 4242 4242' 
                  maxLength='19'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                />
                <p className='text-xs text-gray-500 mt-1'>Test: 4242 4242 4242 4242</p>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Expiry (MM/YY)</label>
                  <input 
                    id='cardExpiry'
                    type='text' 
                    placeholder='12/25' 
                    maxLength='5'
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>CVC</label>
                  <input 
                    id='cardCvc'
                    type='text' 
                    placeholder='123' 
                    maxLength='4'
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                  />
                </div>
              </div>

              <button 
                type='submit' 
                disabled={paymentState.loading}
                className='w-full bg-indigo-600 text-white py-2 rounded-md font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
                {paymentState.loading ? 'Processing...' : 'Complete Payment'}
              </button>

              <button 
                type='button'
                onClick={closePaymentModal}
                className='w-full bg-gray-200 text-gray-800 py-2 rounded-md font-medium hover:bg-gray-300 transition-colors'>
                Cancel
              </button>

              <p className='text-xs text-gray-500 text-center'>
                This is a test payment. Use test card 4242 4242 4242 4242 with any future date and any CVC.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyAppointments
