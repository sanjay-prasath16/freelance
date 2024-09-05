import { useState } from "react";
import { CiUser } from "react-icons/ci";
import { MdOutlineLock } from "react-icons/md";
import Image from '../assets/validate.png';
import { HiEye, HiEyeOff } from "react-icons/hi";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import toast from "react-hot-toast";

const Login = () => {
    const [usernameFocused, setUsernameFocused] = useState(false);
    const [passwordFoused, setpasswordFoused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [data, setData] = useState({
        username: '',
        password: ''
    });

    const navigate = useNavigate();

    const loginUser = async (e) => {
        e.preventDefault();
        const { username, password } = data;
        try {
            const { data:responseData } = await axios.post('/', {
                username,
                password
            });
            if(responseData.err) {
                toast.error(responseData.err);
            } else {
                toast.success('Welcome Back! Lets pick up where you left off.');
                navigate('/home');
            }
        } catch(err) {
            console.log(err);
        }
    }

    return (
        <div className="flex h-screen">
            <div className="w-full xl:w-1/2 bg-cream h-full flex flex-col justify-center items-center rounded-r-full">
                <div className="border-2 border-darkGray text-center rounded-2xl p-8 sm:p-10 md:p-8 lg:px-20 lg:py-12">
                    <h1 className="text-3xl font-semibold">Login</h1>
                    <p className="mt-3 text-lg">Join With us today!</p>
                    <form className="mt-8" onSubmit={loginUser}>
                        <div className="relative">
                            <span className={`absolute text-lg top-4 ml-2 ${usernameFocused ? 'text-darkGray ml-3' : ''}`}>
                                <CiUser />
                            </span>
                            <input 
                                type="text" 
                                className={`focus:border-solid   focus:border-darkGray outline-none h-12 rounded-lg pl-8 w-register placeholder:text-black ${usernameFocused ? 'placeholder:text-darkGray' : ''}`} 
                                onFocus={() => setUsernameFocused(true)} 
                                onBlur={() => setUsernameFocused(false)} 
                                placeholder="username"
                                onChange={(e) => {setData(prevData => ({ ...prevData, username: e.target.value }))}}
                            />
                        </div>
                        <div className="relative mt-8">
                            <span className={`absolute text-lg top-icon ml-2 ${passwordFoused ? 'text-darkGray ml-3' : ''}`}>
                                <MdOutlineLock />
                            </span>
                            <input 
                                type={showPassword ? 'text' : 'password'}
                                className={`focus:border-solid focus:border-darkGray outline-none h-12 rounded-lg pl-8 w-register placeholder:text-black ${passwordFoused ? 'placeholder:text-darkGray' : ''}`} 
                                onFocus={() => setpasswordFoused(true)} 
                                onBlur={() => setpasswordFoused(false)} 
                                placeholder="Password"
                                autoComplete="off"
                                onChange={(e) => {setData(prevData => ({ ...prevData, password: e.target.value }))}}
                            />
                            <span className={`absolute text-lg top-4 right-2 ${passwordFoused ? 'text-darkGray ml-3' : ''}`}>
                                {showPassword ?
                                    <HiEye className="z-10 cursor-pointer" onClick={() => setShowPassword(false)} /> :
                                    <HiEyeOff className="z-10 cursor-pointer" onClick={() => setShowPassword(true)} />
                                }
                            </span>
                        </div>
                        <button className="mt-10 border border-darkGray p-2 w-register bg-darkGray rounded-xl text-white font-semibold text-base">login</button>
                        <div className='mt-5'>
                            Already Have an Account?
                            <span className='text-customBlue font-medium underline underline-offset-4 cursor-pointer'>
                                <Link to="/register" >Register</Link>
                            </span>
                        </div>
                    </form>
                </div>
            </div>
            <div className="w-1/2 hidden xl:block relative overflow-hidden">
                <img src={Image} alt="" className="absolute bottom-0 right-10 top-12 h-regImage" />
            </div>
        </div>
    );
}

export default Login;