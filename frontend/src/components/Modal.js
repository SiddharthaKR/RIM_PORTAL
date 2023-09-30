import React, { useEffect, useState } from 'react'
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

export default function Modal() {
    const [openRequest, setOpenRequest] = useState(false);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [startDate, setStartDate] = React.useState(dayjs());
    const [endDate, setEndDate] = React.useState(dayjs());
    const [startTime, setStartTime] = React.useState(dayjs());
    const [endTime, setEndTime] = React.useState(dayjs());
    const [purchaseDate, setPurchaseDate] = React.useState(dayjs());
    const [ownedBy, setOwnedBy] = React.useState('');
    const [category, setCategory] = React.useState('');
    const [booked, setBooked] = useState({});
    const [errorRange, setErrorRange] = useState(false);
    const [invalidDate, setInvalidDate] = useState(false);

    const handleOwnership = (event) => {
        setOwnedBy(event.target.value);
    };
    const handleCategory = (event) => {
        setCategory(event.target.value);
    };

    // const [value, setValue] = React.useState(dayjs());

    const handleClickOpenRequest = () => {
        setOpenRequest(true);
    };

    const handleCloseRequest = () => {
        setOpenRequest(false);
    };

    const handleClickOpenAddModal = () => {
        setOpenAddModal(true);
    };

    const handleCloseAddModal = () => {
        setOpenAddModal(false);
    };

    function roundMinutes(d) {
        const date = new Date(d);
        date.setHours(date.getHours() + Math.round(date.getMinutes() / 60));
        date.setMinutes(0, 0, 0); // Resets also seconds and milliseconds

        return date.getTime();
    }

    let timeSlot = [
        {
            Start: 1675286076000,
            End: 1675472840000
        },
        {
            Start: 1675712800000,
            End: 1676012276000
        }
    ];

    //set occupied time to next nearest hour   
    const occupiedTime = timeSlot.map((item) => {
        return { Start: roundMinutes(item.Start), End: roundMinutes(item.End) };
    })

    useEffect(() => {

        const temp = { ...booked, startDate: new Date().getTime(), endDate: new Date().getTime(), startTime: new Date().getTime(), endTime: new Date().getTime() };
        setBooked(temp);
        // eslint-disable-next-line
    }, [])

    const isValidRange = () => {
        const sDate = new Date(booked.startDate);
        const sTime = new Date(booked.startTime);
        const eDate = new Date(booked.endDate);
        const eTime = new Date(booked.endTime);
        const startRange = new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate(), sTime.getHours(), sTime.getMinutes(), sTime.getSeconds()).getTime();
        const endRange = new Date(eDate.getFullYear(), eDate.getMonth(), eDate.getDate(), eTime.getHours(), eTime.getMinutes(), eTime.getSeconds()).getTime();
        // console.log("Startrange: " + startRange);
        // console.log("endRange: " + endRange);
        let flag = false;
        occupiedTime.forEach((item => {
            if (startRange <= item.Start && item.End <= endRange) {
                flag = true;
            }
        }))

        if (startRange > endRange)
            setInvalidDate(true);
        else
            setInvalidDate(false);
        return flag;
    }

    const checkAvailabilityDate = (date) => {
        //return true if disabled
        const dt = date.toDate();
        const time1 = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 0, 0, 0).getTime();
        const time2 = time1 + 86400000;

        // console.log(date.toDate());
        // console.log(time1 + " " + time2);
        let flag = false;
        occupiedTime.forEach((item => {
            if (item.Start <= time1 && time2 <= item.End) {
                flag = true;
            }
        }))
        return flag;
    };
    const checkAvailabilityStart = (timeValue, clockType) => {
        //return true if disabled
        if (clockType === 'hours') {
            const date = startDate.toDate();
            const hour1 = new Date(date.getFullYear(), date.getMonth(), date.getDate(), timeValue).getTime();
            const hour2 = hour1 + 3600000;
            // console.log(date);
            // console.log("hours: " + hour1 + " " + hour2);
            let flag = false;
            occupiedTime.forEach((item => {
                if (item.Start <= hour1 && hour2 <= item.End) {
                    flag = true;
                }
            }))
            return flag;
        }
        return false;
    };
    const checkAvailabilityEnd = (timeValue, clockType) => {
        //return true if disabled
        if (clockType === 'hours') {
            const date = endDate.toDate();
            const hour1 = new Date(date.getFullYear(), date.getMonth(), date.getDate(), timeValue).getTime();
            const hour2 = hour1 + 3600000;
            // console.log(date);
            // console.log("hours: " + hour1 + " " + hour2);
            let flag = false;
            occupiedTime.forEach((item => {
                if (item.Start <= hour1 && hour2 <= item.End) {
                    flag = true;
                }
            }))

            return flag;
        }
        return false;
    };



    useEffect(() => {
        const flag = isValidRange();
        setErrorRange(flag);
        // console.log("Range is: " + flag);
    }, [booked])

    return (
        <div className='h-screen flex flex-col justify-center items-center border gap-12'>
            <Button variant="contained" onClick={handleClickOpenRequest}>
                Request modal
            </Button>
            <Button variant="contained" onClick={handleClickOpenAddModal}>
                Add an item modal
            </Button>
            <Dialog open={openRequest} onClose={handleCloseRequest}>
                <DialogTitle className='bg-[#032538] text-white flex justify-between'>
                    <div className='text-2xl'>Request Form</div>
                    <div className='grid grid-cols-2 items-center'>
                        <p className='text-base text-right mr-4 text-white/90'>Item: </p>
                        <p className='text-sm font-normal text-white/80'>Hp Monitor</p>
                        <p className='text-base text-right mr-4 text-white/90'>Owned By: </p>
                        <p className='text-sm font-normal text-white/80'>Coding Club</p>
                        <p className='text-base text-right mr-4 text-white/90'>Requested By: </p>
                        <p className='text-sm font-normal text-white/80'>4i Labs</p>
                    </div>
                </DialogTitle>
                <DialogContent>
                    {/* <DialogContentText>
                        To subscribe to this website, please enter your email address here. We
                        will send updates occasionally.
                    </DialogContentText> */}
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <div>
                            <h3 className='font-medium mt-2 mb-4'>From Time</h3>
                            <div className='flex justify-between gap-8'>
                                <DatePicker
                                    renderInput={(props) => <TextField {...props} />}
                                    label="Select Date"
                                    value={startDate}
                                    onChange={(newValue) => {
                                        setStartDate(newValue);
                                        // setStartTime(newValue);
                                        // console.log(newValue.toDate());
                                        const temp = { ...booked, startDate: newValue.toDate().getTime() };
                                        // console.log(temp);
                                        setBooked(temp);
                                    }}
                                    shouldDisableDate={checkAvailabilityDate}
                                />
                                <TimePicker
                                    renderInput={(params) => <TextField {...params} />}
                                    label="Select Time"
                                    value={startTime}
                                    onChange={(newValue) => {
                                        setStartTime(newValue);
                                        const temp = { ...booked, startTime: newValue.toDate().getTime() };
                                        // console.log(temp);
                                        setBooked(temp);
                                        // console.log(newValue.toDate().getTime());
                                    }}
                                    disabled={!booked.startDate}
                                    // views={['hours']}
                                    // disableMinutes={true}
                                    shouldDisableTime={checkAvailabilityStart}
                                />
                            </div>
                            <h3 className='font-medium my-4'>To Time</h3>
                            <div className='flex justify-between gap-8'>
                                <DatePicker
                                    renderInput={(props) => <TextField {...props} />}
                                    label="Select Date"
                                    value={endDate}
                                    onChange={(newValue) => {
                                        setEndDate(newValue);
                                        const temp = { ...booked, endDate: newValue.toDate().getTime() };
                                        // console.log(temp);
                                        setBooked(temp);
                                    }}
                                    shouldDisableDate={checkAvailabilityDate}
                                />
                                <TimePicker
                                    renderInput={(params) => <TextField {...params} />}
                                    label="Select Time"
                                    value={endTime}
                                    onChange={(newValue) => {
                                        setEndTime(newValue);
                                        const temp = { ...booked, endTime: newValue.toDate().getTime() };
                                        // console.log(temp);
                                        setBooked(temp);
                                    }}
                                    disabled={!booked.endDate}
                                    shouldDisableTime={checkAvailabilityEnd}
                                />
                            </div>
                            {errorRange && <p className={` text-[#d32f2f] font-normal text-sm`}>Enter valid date range</p>}
                            {invalidDate && <p className={` text-[#d32f2f] font-normal text-sm`}>Start date must be smaller than end date</p>}
                        </div>
                    </LocalizationProvider>
                    <div className='mt-6 flex flex-col gap-8'>
                        <TextField id="remarks" label="Purpose/Remarks" variant="outlined" />
                        <TextField required id="remarks" label="Quantity" variant="outlined" />
                    </div>
                </DialogContent>
                <DialogActions className='m-4 flex gap-2'>
                    <Button variant="outlined" onClick={handleCloseRequest} style={{
                        // backgroundColor: "#021018",
                        color: "#021018",
                        border: "1px solid #021018",
                        padding: "0.5rem 2rem",
                        // boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)"
                    }}>Cancel</Button>
                    <Button variant="contained" onClick={handleCloseRequest} style={{
                        backgroundColor: "#021018",
                        color: "white",
                        padding: "0.5rem 2rem",
                        // boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)"
                    }} disabled={errorRange}>Submit</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openAddModal} onClose={handleCloseAddModal}>
                <DialogTitle className='bg-[#032538] text-white'>
                    <div className='text-2xl'>Add an Item</div>
                </DialogTitle>
                <DialogContent>
                    {/* <DialogContentText>
                        To subscribe to this website, please enter your email address here. We
                        will send updates occasionally.
                    </DialogContentText> */}
                    <div className='mt-8 flex flex-col gap-8'>
                        <TextField id="item-name" label="Item Name" variant="outlined" />
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <div className='grid grid-cols-2 gap-8'>
                                <TextField id="quantity" label="Quantity" variant="outlined" />
                                <DateTimePicker
                                    renderInput={(props) => <TextField {...props} />}
                                    label="Purchase Date"
                                    value={purchaseDate}
                                    onChange={(newValue) => {
                                        setPurchaseDate(newValue);
                                    }}
                                />
                            </div>
                        </LocalizationProvider>
                        <div className='grid grid-cols-2 gap-8'>
                            <FormControl fullWidth>
                                <InputLabel id="owned-by">Owned By</InputLabel>
                                <Select
                                    id="owned-by"
                                    value={ownedBy}
                                    label="Owned By"
                                    onChange={handleOwnership}
                                >
                                    <MenuItem value={"coding_club"}>Coding Club</MenuItem>
                                    <MenuItem value={"design_club"}>Design Club</MenuItem>
                                    <MenuItem value={"robotics_club"}>Robotics Club</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl fullWidth>
                                <InputLabel id="category">Category</InputLabel>
                                <Select
                                    id="category"
                                    value={category}
                                    label="Category"
                                    onChange={handleCategory}
                                >
                                    <MenuItem value={"major"}>Major Equipment</MenuItem>
                                    <MenuItem value={"minor"}>Minor Equipment</MenuItem>
                                    <MenuItem value={"consumables"}>Consumables</MenuItem>
                                    <MenuItem value={"furniture"}>Furniture</MenuItem>
                                    <MenuItem value={"books"}>Books</MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                        <div className='grid grid-cols-3 gap-8'>
                            <div>
                                <p className='font-medium'>Bill</p>
                                <Button variant="outlined" component="label" fullWidth>
                                    Upload
                                    <input hidden accept="image/*" multiple type="file" />
                                </Button>
                            </div>
                            <div>
                                <p className='font-medium'>Sanction letter</p>
                                <Button variant="outlined" component="label" fullWidth>
                                    Upload
                                    <input hidden accept="image/*" multiple type="file" />
                                </Button>
                            </div>
                            <div>
                                <p className='font-medium'>Purchase order</p>
                                <Button variant="outlined" component="label" fullWidth>
                                    Upload
                                    <input hidden accept="image/*" multiple type="file" />
                                </Button>
                            </div>
                        </div>
                        {/* <TextField required id="remarks" label="Quantity" variant="outlined" /> */}
                        <TextField id="remarks" label="Remarks/Description" variant="outlined" />
                    </div>
                </DialogContent>
                <DialogActions className='m-4 flex gap-2'>
                    <Button variant="outlined" onClick={handleCloseAddModal} style={{
                        // backgroundColor: "#021018",
                        color: "#021018",
                        border: "1px solid #021018",
                        padding: "0.5rem 2rem",
                        // boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)"
                    }}>Cancel</Button>
                    <Button variant="contained" onClick={handleCloseAddModal} style={{
                        backgroundColor: "#021018",
                        color: "white",
                        padding: "0.5rem 2rem",
                        // boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)"
                    }}>Submit</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
