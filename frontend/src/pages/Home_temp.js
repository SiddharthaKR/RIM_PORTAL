import React from 'react'
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
const Home = () => {
    return (
        <>
            <Navbar />
            <div className='h-screen flex flex-col justify-center items-center border gap-12'>
                <h2 className='font-bold text-[5rem]'>Home Page</h2>
                <Button variant="contained">
                    <Link to="/login">Go to Login</Link>
                </Button>
                <Button variant="contained">
                    <Link to="/modal">Go to Modal page</Link>
                </Button>
                <Button variant="contained">
                    <Link to="/table">Go to Table</Link>
                </Button>
                <Button variant="contained">
                    <Link to="/main">Go to Main Page</Link>
                </Button>
            </div>
        </>
    )
}

export default Home