import React, { useState } from 'react'



const Login = () => {


  const [state, setState] = useState('Sign Up')

  const [email, setEmail] = useState('')

  const [password, setPassword] = useState('')

  const [name, setName] = useState('')

  const onSubmitHandler = async (event) => {
    event.preventDefault()

  }


  return (


    <form action=""
      onSubmit={onSubmitHandler}
      className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg'>
        <p className='text-2xl font-semibold'>{state === 'Sign Up' ? 'Create Account' : 'Login'}</p>
        <p>Please {state === 'Sign Up' ? 'Sign Up' : 'Login'} to book appointments</p>
        {
          state === 'Sign Up' ?
            <div className='w-full'>
              <p>Full Name</p>
              <input className='w-full p-2 border border-zinc-300 rounded-md' type="text" placeholder='Enter your name' onChange={(e) => setName(e.target.value)} value={name} />
            </div>
            : null
        }
        <div className='w-full'>
          <p>Email</p>
          <input className='w-full p-2 border border-zinc-300 rounded-md' type="email" placeholder='Enter your email' onChange={(e) => setEmail(e.target.value)} value={email} />
        </div>
        <div className='w-full'>
          <p>Password</p>
          <input className='w-full p-2 border border-zinc-300 rounded-md' type="password" placeholder='Enter your password' onChange={(e) => setPassword(e.target.value)} value={password} />
        </div>
        <button className='w-full py-2 text-white bg-blue-600 rounded-md' type='submit'>{state === 'Sign Up' ? 'Create Account' : 'Login'}</button>
        <p>{state === 'Sign Up' ? 'Already have an account?' : 'Don\'t have an account?'} <span className='text-blue-600 cursor-pointer font-medium' onClick={() => setState(prev => prev === 'Sign Up' ? 'Login' : 'Sign Up')}>{state === 'Sign Up' ? 'Login Here' : 'Create An Account'}</span></p>
      </div>
    </form>

  )

}

export default Login
