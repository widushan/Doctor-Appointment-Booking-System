import React from 'react'
import { specialityData } from '../assets/assets'
import { Link } from 'react-router-dom'


const SpecialityMenu = () => {


  return (


    <div id='speciality' className='flex flex-col items-center gap-4 py-16 text-gray-800'>


      <h1 className='text-3xl font-medium'>Find the Right Specialist for Your Needs</h1>
      <p className='sm:w-1/3 text-center text-sm'>Easily explore a wide range of medical specialists and book appointments with qualified doctors tailored to your health concerns.</p>

      <div className='flex sm:justify-center gap-4 pt-5 w-full overflow-scroll'>
        {specialityData.map((item, index)=>(
            <Link className='flex flex-col items-center cursor-pointer text-xs flex-shrink-0 hover:translate-y-[-10px] transition-all duration-500' 
            onClick={()=>scrollTo(0,0)}
            key={index} to={`/doctors/${item.speciality}`}>
              <img className='w-16 sm:w-24 mb-2' src={item.image} alt="" />
              <p>{item.speciality}</p>
            </Link>
        ))}
      </div>


    </div>


  )

}


export default SpecialityMenu
