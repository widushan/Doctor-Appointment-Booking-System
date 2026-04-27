import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'

const DoctorsList = () => {

    const { doctors, aToken, getAllDoctors} = useContext(AdminContext)

    useEffect(() => {
        if (aToken) {
            getAllDoctors()
        }
    }, [aToken])

    return (
        <div className='m-5 max-h-[90vh] overflow-y-scroll'>
            
            <h1 className='text-lg font-medium'>All Doctors</h1>

           <div className='w-full flex flex-wrap gap-4 pt-5 gap-y-6'>
                {
                    doctors.map((item, index) => (
                        <div key={index} className='border border-indigo-200  rounded-xl max-w-56 overflow-hidden cursor-pointer group'>
                            <img src={item.image} alt={item.name} className='bg-indigo-50  group-hover:bg-primary transition-all duration-500' />
                            <div>
                                <p className='font-medium'>{item.name}</p>
                                <p>{item.speciality}</p>
                                <div>
                                    <input type="checkbox" checked={item.available} />
                                    <p>Available</p>
                                </div>
                            </div>
                        </div>
                    ))
                }
           </div>

        </div>
    )
}

export default DoctorsList