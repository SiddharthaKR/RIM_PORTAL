import React, { useEffect, useState } from 'react'
import background from "../images/login_background.jpg";
import Box from '@mui/material/Box';
import { TextField, Button } from '@mui/material';
import isEmail from 'validator/lib/isEmail';
import axios from 'axios';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const theme = createTheme({
    palette: {
        primary: {
            // light: will be calculated from palette.primary.main,
            main: 'rgba(255, 255, 255, 0.6)',
            // dark: will be calculated from palette.primary.main,
            // contrastText: will be calculated to contrast with palette.primary.main
        },
        text: {
            primary: "rgba(255, 255, 255, 0.8)"
        }
    },
});


const Login = (props) => {
    const navigate = useNavigate();
    const [isValid, setIsValid] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [dirty, setDirty] = useState(false);
    const { setUser } = props;
    const [openSuccessMsg, setOpenSuccessMsg] = useState(false);
    const [openErrorMsg, setOpenErrorMsg] = useState(false);
    const [openNetworkErrorMsg, setOpenNetworkErrorMsg] = useState(false);
    const handleClickNetworkErrorMsg = () => {
        setOpenNetworkErrorMsg(true);
    };

    const handleCloseNetworkErrorMsg = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpenNetworkErrorMsg(false);
    };

    const handleClickSuccessMsg = () => {
        setOpenSuccessMsg(true);
    };

    const handleCloseSuccessMsg = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpenSuccessMsg(false);
    };

    const handleClickErrorMsg = () => {
        setOpenErrorMsg(true);
    };

    const handleCloseErrorMsg = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpenErrorMsg(false);
    };

    const validateToken = async (token) => {
        try {
            const credentials = { jwt: token };
            axios.post("http://localhost:4000/checkToken", credentials)
                .then((res) => {
                    setUser(res.data.user);
                    navigate('/');
                }).catch((e) => {
                });
        }
        catch (e) {
            handleClickNetworkErrorMsg();
        }
    }

    useEffect(() => {
        const token = JSON.parse(localStorage.getItem('rim-jwt'));
        if (token) {
            validateToken(token);
        }

        //eslint-disable-next-line
    }, []);


    const handleEmailChange = (e) => {
        const val = e.target.value;

        if (isEmail(val)) {
            setIsValid(true);
        }
        else {
            setIsValid(false);
        }
        setEmail(val);
    }

    const handlePasswordChange = (e) => {
        const val = e.target.value;
        setPassword(val);
    }

    const handleSubmit = async (e) => {
        try {
            handleCloseErrorMsg();
            const credentials = { userID: email, password: password };
            // console.log(credentials);
            axios.post("http://localhost:4000/login", credentials)
                .then((res) => {
                    localStorage.setItem('rim-jwt', JSON.stringify(res.data.jwt));
                    handleClickSuccessMsg();
                    setTimeout(() => {
                        navigate('/');
                    }, 1000);
                }).catch((e) => {
                    handleClickErrorMsg();
                });
        }
        catch (e) {
            alert('Internal server error. Please try again later.');
        }
    }

    const vertical = 'top'
    const horizontal = 'center';

    return (
        <>
            <ThemeProvider theme={theme}>
                <Snackbar open={openSuccessMsg} autoHideDuration={6000} onClose={handleCloseSuccessMsg}>
                    <Alert onClose={handleCloseSuccessMsg} severity="success" sx={{ width: '100%' }}>
                        Successfully logged in!
                    </Alert>
                </Snackbar>
                <Snackbar open={openErrorMsg} autoHideDuration={6000} onClose={handleCloseErrorMsg}>
                    <Alert onClose={handleCloseErrorMsg} severity="error" sx={{ width: '100%' }}>
                        Invalid email or Password!
                    </Alert>
                </Snackbar>
                <Snackbar open={openNetworkErrorMsg} autoHideDuration={6000} onClose={handleCloseNetworkErrorMsg} anchorOrigin={{ vertical, horizontal }}>
                    <Alert onClose={handleCloseNetworkErrorMsg} severity="error" sx={{ width: '100%' }}>
                        Network error. Please try again later!
                    </Alert>
                </Snackbar>
                <div className='login-container h-full w-screen bg-top bg-no-repeat bg-cover' style={{ backgroundImage: `url(${background})` }} >
                    <div className='bg-[#032538] min-h-screen h-full w-full md:w-6/12 lg:w-5/12 px-12 py-14'>
                        <h1 className='text-[4.5rem] font-bold text-white max-w-md mx-auto md:mx-0'>
                            RIM
                        </h1>
                        <h1 className='text-[4.5rem] font-bold text-white max-w-md mx-auto md:mx-0'>
                            Portal
                        </h1>
                        <Box
                            component="form"
                            noValidate
                            autoComplete="off"
                            className='flex flex-col px-2 gap-8 py-12 max-w-md mx-auto md:mx-0 relative'
                        >
                            <TextField error={dirty && !isValid} id="email" label="Enter email" variant="standard" value={email} onBlur={() => setDirty(true)} onChange={(e) => handleEmailChange(e)} InputLabelProps={{
                                style: {
                                    color: 'rgba(255, 255, 255, 0.6)',
                                }
                            }} />
                            {dirty && !isValid && <p className={`absolute text-[#d32f2f] font-normal text-xs top-24 left-2`}>Enter valid email address</p>}
                            <TextField id="password" label="Password" variant="standard" type="password" value={password} onChange={(e) => handlePasswordChange(e)} InputLabelProps={{
                                style: {
                                    color: 'rgba(255, 255, 255, 0.6)'
                                }
                            }} />
                            <div className='flex justify-end items-center'>
                                {(password.length && isValid) ?
                                    <Button
                                        style={{
                                            backgroundColor: "#021018",
                                            color: "white",
                                            padding: "0.5rem 2rem",
                                            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)"
                                        }}
                                        className='shadow-lg'
                                        variant="contained"
                                        onClick={(e) => handleSubmit(e)}
                                    >
                                        Login
                                    </Button> :
                                    <Button
                                        style={{
                                            backgroundColor: "#021018",
                                            color: "white",
                                            padding: "0.5rem 2rem",
                                            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)",
                                            cursor: "not-allowed",
                                            userSelect: "none"
                                        }}
                                        className='shadow-lg'
                                        variant="contained"
                                        disabled
                                    >
                                        Login
                                    </Button>
                                }
                            </div>
                        </Box>
                        <div className=' flex items-center justify-between mt-4 max-w-sm mx-auto'>
                            <div className='bg-white rounded-full w-20 h-20 shadow-2xl shadow-black/60 grid place-items-center'>Logo</div>
                            <div className='bg-white rounded-full w-20 h-20 shadow-2xl shadow-black/60 grid place-items-center'>Logo</div>
                            <div className='bg-white rounded-full w-20 h-20 shadow-2xl shadow-black/60 grid place-items-center'>Logo</div>
                        </div>
                    </div>
                </div>
            </ThemeProvider>
        </>
    )
}

export default Login