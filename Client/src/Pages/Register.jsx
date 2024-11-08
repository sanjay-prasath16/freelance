import { useState } from "react";
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { CiUser } from "react-icons/ci";
import { MdAlternateEmail } from "react-icons/md";
import { MdOutlineLock } from "react-icons/md";
import { FaChevronUp } from "react-icons/fa6";
import { FaChevronDown } from 'react-icons/fa6';
import Image from '../assets/validate.png';
import { HiEye, HiEyeOff } from "react-icons/hi";
import { FaQuestion } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
    const [usernameFocused, setUsernameFocused] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFoused, setpasswordFoused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [roleOpen, setRoleOpen] = useState(false);
    const [data, setData] = useState({
        username: '',
        email: '',
        password: '',
        role: '',
    });

    const [roleList] = useState([
        'Job Seeker',
        'Job Provider'
    ]);

    const navigate = useNavigate();

    const careerToggleDown = () => {
        setRoleOpen((open) => !open);
    };

    const registerUser = async (e) => {
        e.preventDefault();
        const { username, email, password, role } = data;
        try {
            const { data: responseData } = await axios.post('/register', {
                username, email, password, role
            });
            if(responseData.err) {
                toast.error(responseData.err);
            } else {
                setData({});
                toast.success('Congratulations! You are officially part of us.Lets get started');
                navigate('/');
            }
        } catch(err) {
            console.log(err);
        }
    }

    return (
        <div className="flex h-screen">
            <div className="w-full xl:w-1/2 bg-cream h-full flex flex-col justify-center items-center rounded-r-full">
                <div className="border-2 border-darkGray text-center rounded-2xl p-8 sm:p-10 md:p-8 lg:px-20 lg:py-12">
                    <h1 className="text-3xl font-semibold">Register</h1>
                    <p className="mt-3 text-lg">Join With us today!</p>
                    <form className="mt-8" onSubmit={registerUser}>
                        <div className="relative">
                            <span className={`absolute text-lg top-4 ml-2 ${usernameFocused ? 'text-darkGray ml-3' : ''} z-10`}>
                                <CiUser />
                            </span>
                            <input 
                                type="text" 
                                className={`focus:border-solid focus:border-darkGray outline-none h-12 rounded-lg pl-8 w-register placeholder:text-black ${usernameFocused ? 'placeholder:text-darkGray' : ''}`} 
                                onFocus={() => setUsernameFocused(true)} 
                                onBlur={() => setUsernameFocused(false)} 
                                placeholder="username"
                                onChange={(event) => {setData(prevData => ({ ...prevData, username: event.target.value}))}}
                            />
                        </div>
                        <div className="relative mt-8">
                            <span className={`absolute text-lg top-4 ml-2 ${emailFocused ? 'text-darkGray ml-3' : ''} z-10`}>
                                <MdAlternateEmail />
                            </span>
                            <input 
                                type="email"
                                className={`focus:border-solid focus:border-darkGray outline-none h-12 rounded-lg pl-8 w-register placeholder:text-black ${emailFocused ? 'placeholder:text-darkGray' : ''}`} 
                                onFocus={() => setEmailFocused(true)} 
                                onBlur={() => setEmailFocused(false)} 
                                placeholder="email"
                                onChange={(event) => {setData(prevData => ({ ...prevData, email: event.target.value}))}}
                            />
                        </div>
                        <div className="relative mt-8">
                            <span className={`absolute text-lg top-4 ml-2 ${passwordFoused ? 'text-darkGray ml-3' : ''} z-10`}>
                                <MdOutlineLock />
                            </span>
                            <input 
                                type={showPassword ? 'text' : 'password'}
                                className={`focus:border-solid focus:border-darkGray outline-none h-12 rounded-lg pl-8 w-register placeholder:text-black ${passwordFoused ? 'placeholder:text-darkGray' : ''}`} 
                                onFocus={() => setpasswordFoused(true)} 
                                onBlur={() => setpasswordFoused(false)} 
                                placeholder="Password"
                                autoComplete="off"
                                onChange={(event) => {setData(prevData => ({ ...prevData, password: event.target.value}))}}
                            />
                            <span className={`absolute text-lg top-4 right-2 ${passwordFoused ? 'text-darkGray ml-3' : ''}`}>
                                {showPassword ?
                                    <HiEye className="z-10 cursor-pointer" onClick={() => setShowPassword(false)} /> :
                                    <HiEyeOff className="z-10 cursor-pointer" onClick={() => setShowPassword(true)} />
                                }
                            </span>
                        </div>
                        <div className="relative mt-8">
                            <span className={`absolute left-2 text-lg top-4 z-10`}>
                                <FaQuestion />
                            </span>
                            <div 
                                onClick={careerToggleDown} 
                                className={`flex justify-between items-center p-4 bg-customGray cursor-pointer text-black bg-white h-12 rounded-lg pl-8 w-register`}>
                                {data.role || 'Select Role'}
                                <span className='ml-4'>{roleOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
                            </div>
                            <div className={`absolute left-0 mt-2 w-full bg-white rounded-lg shadow-lg transition-opacity duration-300 ${roleOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                                {roleOpen && (
                                    <div className="flex flex-col space-y-2 mt-2 h-24">
                                        {roleList.map((item, index) => (
                                            <div 
                                                key={index} 
                                                className={`p-2 hover:bg-gray-100 rounded-lg ml-1 mr-1 cursor-pointer`}
                                                onClick={() => {setRoleOpen(false); setData(prevData => ({ ...prevData, role: item }))
                                            }}>
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <button className="mt-10 border border-darkGray p-2 w-register bg-darkGray rounded-xl text-white font-semibold text-base">register</button>
                        <div className='mt-5'>
                            Already Have an Account?
                            <span className='text-customBlue font-medium underline underline-offset-4 cursor-pointer'>
                                <Link to="/" >Login</Link>
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

export default Register;