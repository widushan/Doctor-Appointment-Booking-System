import React, { useContext } from 'react'
import Login from './pages/Login'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AdminContext } from './context/AdminContext'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Admin/Dashboard'
import AddDoctor from './pages/Admin/AddDoctor'
import DoctorsList from './pages/Admin/DoctorsList'
import AllAppointments from './pages/Admin/AllAppointments'
import { DoctorContext } from './context/DoctorContext'
import DoctorDashboard from './pages/Doctor/DoctorDashboard'
import DoctorProfile from './pages/Doctor/DoctorProfile'
import DoctorAppointments from './pages/Doctor/DoctorAppointments'


const App = () => {

  const { aToken } = useContext(AdminContext)
  const { dToken } = useContext(DoctorContext)


  return aToken || dToken ? (
    <div className='bg-[#F8F9FD]'>
      <ToastContainer />
      <Navbar />
      <div className='flex items-start'>
        <Sidebar />
        <Routes>

          {/*Admin Route*/}
          <Route path='/' element={<></>} />
          <Route path='/admin-dashboard' element={<Dashboard />} />
          <Route path='/add-doctor' element={<AddDoctor />} />
          <Route path='/doctors-list' element={<DoctorsList />} />
          <Route path='/all-appointments' element={<AllAppointments />} />

          {/*Doctor Route*/}
          <Route path='/doctor-dashboard' element={<DoctorDashboard />} />
          <Route path='/doctor-profile' element={<DoctorProfile />} />
          <Route path='/doctor-appointments' element={<DoctorAppointments />} />


        </Routes>
      </div>
    </div>
  ) : (
    <>
      <Login />
      <ToastContainer />
    </>
  );

}


export default App