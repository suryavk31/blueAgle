import React, { useState } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const Login = () => {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('PHONE'); // PHONE, OTP
    const [confirmObj, setConfirmObj] = useState(null);
    const navigate = useNavigate();

    const generateRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': (response) => {
                    // reCAPTCHA solved
                }
            });
        }
    }

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (phone.length < 10) return toast.error("Invalid phone number");

        const phoneNumber = "+91" + phone; // Assuming India for now
        generateRecaptcha();
        const appVerifier = window.recaptchaVerifier;

        try {
            const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
            window.confirmationResult = confirmationResult;
            setConfirmObj(confirmationResult);
            setStep('OTP');
            toast.success("OTP Sent!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to send OTP. " + error.message);
        }
    }

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) return toast.error("Invalid OTP");

        try {
            const result = await confirmObj.confirm(otp);
            const user = result.user;
            const token = await user.getIdToken();

            // Sync with backend
            await axios.post('http://localhost:5000/api/auth/login', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success("Logged In Successfully");
            navigate('/');
        } catch (error) {
            console.error(error);
            toast.error("Invalid OTP or Error verifying");
        }
    }

    return (
        <div className="flex justify-center items-center min-h-[70vh] px-4 bg-gray-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
                <h2 className="text-2xl font-black mb-2 text-center text-[#1a1a4e]">Welcome Back</h2>
                <p className="text-gray-400 text-sm text-center mb-8">Login to continue shopping</p>
                <div id="recaptcha-container"></div>

                {step === 'PHONE' ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Phone Number</label>
                            <div className="flex">
                                <span className="bg-gray-100 p-3 rounded-l-xl border border-r-0 border-gray-200 text-gray-500 flex items-center">+91</span>
                                <input
                                    type="text"
                                    className="w-full border border-gray-200 p-3 rounded-r-xl focus:outline-none focus:border-[#ff3269] transition-all"
                                    placeholder="10 digit number"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-[#ff3269] text-white py-3.5 rounded-xl hover:bg-[#e62e5c] font-black shadow-lg shadow-pink-100 transition-all">
                            Send OTP
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Enter 6-digit OTP</label>
                            <input
                                type="text"
                                className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:border-[#ff3269] text-center text-2xl tracking-[12px]"
                                placeholder="XXXXXX"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="w-full bg-[#3c006b] text-white py-3.5 rounded-xl hover:bg-[#2d0050] font-black shadow-lg shadow-purple-100">
                            Verify & Login
                        </button>
                        <button type="button" onClick={() => setStep('PHONE')} className="w-full text-blue-600 text-xs font-bold mt-2 hover:underline">
                            Change Phone Number
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;
