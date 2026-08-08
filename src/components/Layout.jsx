import React from 'react'
import Navbar from './Navbar'
import {Outlet} from "react-router-dom"
const Layout = () => {
  return (
    <>
   <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main> 
        </div>
    </>
  )
}

export default Layout