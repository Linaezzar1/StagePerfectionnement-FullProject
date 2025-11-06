import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './loginSignup.css';
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import axios from 'axios';
import { login, setLoading, setError } from '../../store/action'; 
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [action, setAction] = useState('');
    const dispatch = useDispatch();
    const isLoading = useSelector(state => state.isLoading);
    const error = useSelector(state => state.error);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        dispatch(setLoading(true));
        try {
            const response = await axios.post('http://localhost:3000/user/signup', {
                name: username,
                email: email,
                password: password,
            });
            console.log("Registration successful. You can now log in.");
            dispatch(setLoading(false));
            setAction('');
            setUsername('');
            setEmail('');
            setPassword('');
        } catch (error) {
            console.error(error);
            dispatch(setError("Registration failed. Please try again."));
            dispatch(setLoading(false));
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        dispatch(setLoading(true));
        try {
            const response = await axios.post('http://localhost:3000/user/login', {
                email: email,
                password: password,
            });
            console.log("Login successful");
            const token = response.data.mytoken; 
            console.log(response);
            console.log("Login successful");
            
            localStorage.setItem('token', token); 
            dispatch(login(token)); 
            dispatch(setLoading(false));

            navigate('/UserFilePage');
        } catch (error) {
            console.error(error);
            dispatch(setError("Login failed. Please check your credentials."));
            dispatch(setLoading(false));
        }
    };

    const registerLink = () => {
        setAction('active');
    };

    const loginLink = () => {
        setAction('');
    };

    return (
        <div className={`wrapper ${action}`}>
            <div className='form-box login'>
                <form onSubmit={handleLogin}>
                    <h1>Login</h1>
                    {error && <p className="error">{error}</p>}
                    <div className='input-box'>
                        <input type='email' placeholder='Email' value={email}
                            onChange={(e) => setEmail(e.target.value)} required /> <FaEnvelope className='icon' />
                    </div>
                    <div className='input-box'>
                        <input type='password' placeholder='Password' value={password}
                            onChange={(e) => setPassword(e.target.value)} required /> <FaLock className='icon' />
                    </div>
                    <button type='submit' disabled={isLoading}>{isLoading ? 'Loading...' : 'Login'}</button>
                    <div className='register-link'>
                        <p>Don't have an account? <a href='#' onClick={registerLink}>Register</a> </p>
                    </div>
                </form>
            </div>

            <div className='form-box register'>
                <form onSubmit={handleRegister}>
                    <h1>Registration</h1>
                    {error && <p className="error">{error}</p>}
                    <div className='input-box'>
                        <input type='text' placeholder='Username' value={username}
                            onChange={(e) => setUsername(e.target.value)} required /> <FaUser className='icon' />
                    </div>
                    <div className='input-box'>
                        <input type='email' placeholder='Email' value={email}
                            onChange={(e) => setEmail(e.target.value)} required /> <FaEnvelope className='icon' />
                    </div>
                    <div className='input-box'>
                        <input type='password' placeholder='Password' value={password}
                            onChange={(e) => setPassword(e.target.value)} required /> <FaLock className='icon' />
                    </div>
                    <button type='submit' disabled={isLoading}>{isLoading ? 'Loading...' : 'Register'}</button>
                    <div className='register-link'>
                        <p>Already have an account? <a href='#' onClick={loginLink}>Login</a> </p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;