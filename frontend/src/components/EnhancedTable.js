import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Table, TableBody, TableContainer, TableHead, TableRow, TableSortLabel, Button, Paper, IconButton, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Select, InputLabel, MenuItem, FormControl, Snackbar, Collapse } from '@mui/material';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import { visuallyHidden } from '@mui/utils';
import { KeyboardArrowDown as KeyboardArrowDownIcon, KeyboardArrowUp as KeyboardArrowUpIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { IoClose } from "react-icons/io5";
import { FiDownload } from "react-icons/fi";
import { FaTrashAlt } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";
import axios from 'axios';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});


const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: "#032538",
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

const theme = createTheme({
    components: {
        MuiTableSortLabel: {
            styleOverrides: {
                root: {
                    color: "lightgray",
                    "&:hover": {
                        color: "white"
                    },
                    "&.Mui-active": {
                        "&&": {
                            color: "white",

                            "& * ": {
                                color: "white"
                            }
                        }
                    }
                },
                icon: {
                    color: "white"
                }
            }
        }
    }
});

function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

function getComparator(order, orderBy) {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

// Since 2020 all major browsers ensure sort stability with Array.prototype.sort().
// stableSort() brings sort stability to non-modern browsers (notably IE11). If you
// only support modern browsers you can replace stableSort(exampleArray, exampleComparator)
// with exampleArray.slice().sort(exampleComparator)
function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) {
            return order;
        }
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}

const headCells = [
    {
        id: 'name',
        numeric: false,
        disablePadding: false,
        label: 'Item name',
    },
    {
        id: 'category',
        numeric: false,
        disablePadding: false,
        label: 'Category',
    },
    {
        id: 'ownedBy',
        numeric: false,
        disablePadding: false,
        label: 'Owned By',
    },
    {
        id: 'heldBy',
        numeric: false,
        disablePadding: false,
        label: 'Held By',
    },
    {
        id: 'quantity',
        numeric: true,
        disablePadding: false,
        label: 'Quantity',
    },
];

function EnhancedTableHead(props) {
    const { order, orderBy, onRequestSort } =
        props;
    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    };

    return (
        <TableHead>
            <TableRow >
                {headCells.map((headCell) => (
                    <StyledTableCell
                        key={headCell.id}
                        align={headCell.numeric ? 'center' : 'left'}
                        padding={headCell.disablePadding ? 'none' : 'normal'}
                        sortDirection={orderBy === headCell.id ? order : false}
                    >
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : 'asc'}
                            onClick={createSortHandler(headCell.id)}
                        >
                            {headCell.label}
                            {orderBy === headCell.id ? (
                                <Box component="span" sx={visuallyHidden}>
                                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                </Box>
                            ) : null}
                        </TableSortLabel>
                    </StyledTableCell>
                ))}
                <StyledTableCell />
            </TableRow>
        </TableHead>
    );
}

EnhancedTableHead.propTypes = {
    onRequestSort: PropTypes.func.isRequired,
    // onSelectAllClick: PropTypes.func.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired,
};

function Row(props) {
    const { row, index, data, setData, user } = props;
    const labelId = `enhanced-table-checkbox-${index}`;
    const [purchaseDate, setPurchaseDate] = useState(row.purchasedOn);
    const [ownedBy, setOwnedBy] = useState(row.ownedBy);
    const [itemName, setItemName] = useState(row.name);
    const [open, setOpen] = useState(false);
    const [openRequest, setOpenRequest] = useState(false);
    const [startDate, setStartDate] = useState(dayjs());
    const [endDate, setEndDate] = useState(dayjs());
    const [startTime, setStartTime] = useState(dayjs());
    const [endTime, setEndTime] = useState(dayjs());
    const [booked, setBooked] = useState({});
    const [errorRange, setErrorRange] = useState(false);
    const [invalidDate, setInvalidDate] = useState(false);
    const [openDownload, setOpenDownload] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [remarks, setRemarks] = useState('');
    const [quantity, setQuantity] = useState('');
    const [editRemarks, setEditRemarks] = useState(row.remarks);
    const [editQuantity, setEditQuantity] = useState(row.quantity);
    const [pageNo, setPageNo] = useState('');
    const [serialNo, setSerialNo] = useState('');
    const [registerNo, setRegisterNo] = useState('');
    const [category, setCategory] = useState(row.category);
    const [bill, setBill] = useState(null);
    const [sanctionLetter, setSanctionLetter] = useState(null);
    const [purchaseOrder, setPurchaseOrder] = useState(null);
    const [inspectionReport, setInspectionReport] = useState(null);
    const [openSuccessMsg, setOpenSuccessMsg] = useState(false);
    const [openErrorMsg, setOpenErrorMsg] = useState(false);
    const [openEditSuccessMsg, setOpenEditSuccessMsg] = useState(false);
    const [openEditErrorMsg, setOpenEditErrorMsg] = useState(false);
    const [openRequestSuccessMsg, setOpenRequestSuccessMsg] = useState(false);
    const [openRequestErrorMsg, setOpenRequestErrorMsg] = useState(false);
    const [openNetworkErrorMsg, setOpenNetworkErrorMsg] = useState(false);

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

    const handleClickEditSuccessMsg = () => {
        setOpenEditSuccessMsg(true);
    };

    const handleCloseEditSuccessMsg = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpenEditSuccessMsg(false);
    };

    const handleClickEditErrorMsg = () => {
        setOpenEditErrorMsg(true);
    };

    const handleCloseEditErrorMsg = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpenEditErrorMsg(false);
    };
    const handleClickRequestSuccessMsg = () => {
        setOpenRequestSuccessMsg(true);
    };

    const handleCloseRequestSuccessMsg = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpenRequestSuccessMsg(false);
    };

    const handleClickRequestErrorMsg = () => {
        setOpenRequestErrorMsg(true);
    };

    const handleCloseRequestErrorMsg = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpenRequestErrorMsg(false);
    };
    const handleClickNetworkErrorMsg = () => {
        setOpenNetworkErrorMsg(true);
    };

    const handleCloseNetworkErrorMsg = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpenNetworkErrorMsg(false);
    };

    const handleOwnership = (event) => {
        setOwnedBy(event.target.value);
    };
    const handleCategory = (event) => {
        setCategory(event.target.value);
    };

    const handleClickEditModal = () => {
        setOpenEditModal(true);
    };

    const handleCloseEditModal = () => {
        setOpenEditModal(false);
    };
    const handleClickDownload = () => {
        setOpenDownload(true);
    };

    const handleCloseDownload = () => {
        setOpenDownload(false);
    };


    function roundMinutes(d) {
        const date = new Date(d);
        date.setHours(date.getHours() + Math.round(date.getMinutes() / 60));
        date.setMinutes(0, 0, 0); // Resets also seconds and milliseconds

        return date.getTime();
    }

    // let timeSlot = [
    //     {
    //         Start: 1675286076000,
    //         End: 1675472840000
    //     },
    //     {
    //         Start: 1675712800000,
    //         End: 1676012276000
    //     }
    // ];

    const bookings = row.bookings;

    //set occupied time to next nearest hour   
    const occupiedTime = bookings.map((request) => {
        return { Start: roundMinutes(request.inTime), End: roundMinutes(request.outTime) };
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
            if (startRange <= item.inTime && item.outTime <= endRange) {
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
            if (item.inTime <= time1 && time2 <= item.outTime) {
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
                if (item.inTime <= hour1 && hour2 <= item.outTime) {
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
                if (item.inTime <= hour1 && hour2 <= item.outTime) {
                    flag = true;
                }
            }))

            return flag;
        }
        return false;
    };

    const handleRemoveItem = (id) => {
        if (window.confirm("Are you sure want to remove this item") === true) {
            // console.log("API call to remove item");
            try {
                // const options = { "ID": id };
                // console.log(options);

                axios.delete("http://localhost:8080/item", {
                    headers: {
                        Authorization: "usertoken"
                    },
                    data: {
                        "ID": id
                    }
                })
                    .then((res) => {
                        const newData = data.filter(el => el._id !== id);
                        setData(newData);
                        handleClickSuccessMsg();
                    }).catch((e) => {
                        handleClickErrorMsg();
                        // alert('Unable to delete item. Please try again later');
                    });
            }
            catch (e) {
                handleClickNetworkErrorMsg();
            }
            setOpen(false);
        } else {
            console.log("Remove item request cancelled");
        }
    }
    const handleSubmitEditModal = (id, documentId) => {
        const options = {
            "name": itemName,
            "category": category,
            "quantity": editQuantity,
            "ownedBy": ownedBy,
            "purchasedOn": purchaseDate,
            "status": "Available",
            "remarks": editRemarks,
            "pageNo": pageNo,
            "serialNo": serialNo,
            "registerNo": registerNo,
            "bookings": []

        };

        const arr = [];
        if (bill)
            arr.push({
                "name": "bill",
                "item": bill
            }
            );
        if (inspectionReport)
            arr.push({
                "name": "inspectionReport",
                "item": inspectionReport
            }
            );
        if (purchaseOrder)
            arr.push({
                "name": "purchaseOrder",
                "item": purchaseOrder
            }
            );
        if (sanctionLetter)
            arr.push({
                "name": "sanctionLetter",
                "item": sanctionLetter
            }
            );

        try {
            axios.all([
                axios.put(`http://localhost:8080/item/${id}`, options, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }),
                arr.map(el => {
                    return (
                        axios.put(`http://localhost:8080/item/${documentId}/${el.name}`, {
                            "file": el.item
                        }, {
                            headers: {
                                "Content-Type": "multipart/form-data",
                            },
                        })
                    )
                })
            ]).then((res) => {
                console.log("Item updated");
                handleCloseEditModal();
                handleClickEditSuccessMsg();
            }).catch((e) => {
                handleCloseEditModal();
                handleClickEditErrorMsg();
            });
        }
        catch (e) {
            handleCloseEditModal();
            handleClickNetworkErrorMsg();
        }
    }

    useEffect(() => {
        const flag = isValidRange();
        setErrorRange(flag);
        // console.log("Range is: " + flag);

        // eslint-disable-next-line
    }, [booked])

    const handleCloseRequest = () => {
        setOpenRequest(false);
    };
    const handleClickOpenRequest = () => {
        setOpenRequest(true);
    };
    const handleViewBill = () => {
        window.open(row.bill, "_blank", "noreferrer");
    }
    const handleViewSanctionLetter = () => {
        window.open(row.sanctionLetter, "_blank", "noreferrer");
    }
    const handleViewPurchaseOrder = () => {
        window.open(row.purchaseOrder, "_blank", "noreferrer");
    }
    const handleViewInspectionReport = () => {
        window.open(row.inspectionReport, "_blank", "noreferrer");
    }

    const handleSubmitRequest = async () => {
        const sDate = new Date(booked.startDate);
        const sTime = new Date(booked.startTime);
        const eDate = new Date(booked.endDate);
        const eTime = new Date(booked.endTime);
        const startRange = new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate(), sTime.getHours(), sTime.getMinutes(), sTime.getSeconds()).getTime();
        const endRange = new Date(eDate.getFullYear(), eDate.getMonth(), eDate.getDate(), eTime.getHours(), eTime.getMinutes(), eTime.getSeconds()).getTime();

        const options = {
            "itemId": row._id,
            "name": row.name,
            "category": row.category,
            "ownedBy": row.ownedBy,
            "requestedBy": user.club,
            "quantity": quantity,
            "requestTime": Date.now(),
            "inTime": startRange,
            "outTime": endRange,
            "requestStatus": "Pending",
            "remarks": remarks
        };
        console.log(options);
        try {
            axios.post("http://localhost:8080/request", options).then((res) => {
                handleCloseRequest();
                handleClickRequestSuccessMsg();
            }).catch((e) => {
                handleCloseRequest();
                handleClickRequestErrorMsg();
            });
        }
        catch (e) {
            handleCloseRequest();
            handleClickNetworkErrorMsg();
        }
    }

    const vertical = 'top'
    const horizontal = 'center';

    const formatDate = (date) => {
        const time = new Date(parseInt(date)).toLocaleTimeString('en-IN', { hour: "2-digit", minute: "2-digit", hour12: true });
        const day = new Date(parseInt(date)).toLocaleString('en-IN', { year: "numeric", month: "short", day: "numeric", time: "12" });
        const outputDate = time + ', ' + day;
        return outputDate;
    }

    return (
        <React.Fragment>
            <TableRow style={index % 2 ? { background: "#A2D5F2" } : { background: "#FAFAFA" }}>
                <TableCell
                    component="th"
                    id={labelId}
                    scope="row"
                >
                    {row.name}
                </TableCell>
                <TableCell align="left">{row.category}</TableCell>
                <TableCell align="left">{row.ownedBy}</TableCell>
                <TableCell align="left">{row.heldBy}</TableCell>
                <TableCell align="center">{row.quantity}</TableCell>
                <TableCell >
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Snackbar open={openSuccessMsg} autoHideDuration={6000} onClose={handleCloseSuccessMsg} anchorOrigin={{ vertical, horizontal }}>
                        <Alert onClose={handleCloseSuccessMsg} severity="success" sx={{ width: '100%' }}>
                            Item deleted successfully!
                        </Alert>
                    </Snackbar>
                    <Snackbar open={openErrorMsg} autoHideDuration={6000} onClose={handleCloseErrorMsg} anchorOrigin={{ vertical, horizontal }}>
                        <Alert onClose={handleCloseErrorMsg} severity="error" sx={{ width: '100%' }}>
                            Unable to delete item. Please try again later!
                        </Alert>
                    </Snackbar>
                    <Snackbar open={openEditSuccessMsg} autoHideDuration={6000} onClose={handleCloseEditSuccessMsg} anchorOrigin={{ vertical, horizontal }}>
                        <Alert onClose={handleCloseEditSuccessMsg} severity="success" sx={{ width: '100%' }}>
                            Item updated successfully!
                        </Alert>
                    </Snackbar>
                    <Snackbar open={openEditErrorMsg} autoHideDuration={6000} onClose={handleCloseEditErrorMsg} anchorOrigin={{ vertical, horizontal }}>
                        <Alert onClose={handleCloseEditErrorMsg} severity="error" sx={{ width: '100%' }}>
                            Unable to edit item. Please try again later!
                        </Alert>
                    </Snackbar>
                    <Snackbar open={openRequestSuccessMsg} autoHideDuration={6000} onClose={handleCloseRequestSuccessMsg} anchorOrigin={{ vertical, horizontal }}>
                        <Alert onClose={handleCloseRequestSuccessMsg} severity="success" sx={{ width: '100%' }}>
                            Request submitted successfully!
                        </Alert>
                    </Snackbar>
                    <Snackbar open={openRequestErrorMsg} autoHideDuration={6000} onClose={handleCloseRequestErrorMsg} anchorOrigin={{ vertical, horizontal }}>
                        <Alert onClose={handleCloseRequestErrorMsg} severity="error" sx={{ width: '100%' }}>
                            Unable to submit request. Please try again later!
                        </Alert>
                    </Snackbar>
                    <Snackbar open={openNetworkErrorMsg} autoHideDuration={6000} onClose={handleCloseNetworkErrorMsg} anchorOrigin={{ vertical, horizontal }}>
                        <Alert onClose={handleCloseNetworkErrorMsg} severity="error" sx={{ width: '100%' }}>
                            Network error. Please try again later!
                        </Alert>
                    </Snackbar>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <div className="flex px-8 py-8 gap-16">
                            <div className='w-full flex flex-col gap-4 justify-between'>
                                {/* <div>{row.description || <span className='italic'>No description provided</span>}</div> */}
                                <div>
                                    <span className='font-medium mr-4'>Remarks : </span>
                                    <span> {row.remarks || <span className='italic'>No remarks</span>}</span>
                                </div>
                                <div>
                                    <span className='font-medium mr-4'>Purchased On : </span>
                                    <span> {formatDate(row.purchasedOn)}</span>
                                </div>
                                {(user?.club === row.ownedBy) ?
                                    <>
                                        <div className='flex gap-8'>
                                            <div className="cursor-pointer text-red-600 hover:underline flex w-fit items-center gap-2" onClick={() => handleRemoveItem(row._id)}>Remove item <FaTrashAlt /></div>
                                            <div className="cursor-pointer text-blue-600 hover:underline flex w-fit items-center gap-2" onClick={() => handleClickEditModal()}>Edit item <FaEdit /></div>
                                        </div>
                                    </>
                                    : ""}
                            </div>
                            <div className="flex flex-col gap-6 w-3/4 items-end">
                                <Button variant="contained" className='w-24' onClick={handleClickOpenRequest}>Request</Button>
                                <div className="cursor-pointer text-blue-600 hover:underline flex justify-center items-center gap-2" onClick={handleClickDownload}>Download Content <FiDownload /></div>
                            </div>
                        </div>
                    </Collapse>
                </TableCell>
            </TableRow>
            <Dialog open={openRequest} onClose={handleCloseRequest}>
                <DialogTitle className='bg-[#032538] text-white flex justify-between'>
                    <div className='text-2xl'>Request Form</div>
                    <div className='grid grid-cols-2 items-center'>
                        <p className='text-base text-right mr-4 text-white/90'>Item: </p>
                        <p className='text-sm font-normal text-white/80'>{row.name}</p>
                        <p className='text-base text-right mr-4 text-white/90'>Owned By: </p>
                        <p className='text-sm font-normal text-white/80'>{row.ownedBy}</p>
                        <p className='text-base text-right mr-4 text-white/90'>Requested By: </p>
                        <p className='text-sm font-normal text-white/80'>{user?.club}</p>
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
                            {errorRange && <p className={` text-[#d32f2f] font-normal text-sm`}>Selected range contains an already booked slot</p>}
                            {invalidDate && <p className={` text-[#d32f2f] font-normal text-sm`}>Start date must be smaller than end date</p>}
                        </div>
                    </LocalizationProvider>
                    <div className='mt-6 flex flex-col gap-8'>
                        <TextField id="remarks" label="Purpose/Remarks" variant="outlined" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                        <TextField required id="quantity" label="Quantity" variant="outlined" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
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
                    <Button variant="contained" onClick={handleSubmitRequest} style={{
                        backgroundColor: "#021018",
                        color: "white",
                        padding: "0.5rem 2rem",
                        // boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)"
                    }} disabled={errorRange}>Submit</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openDownload} onClose={handleCloseDownload}>
                <DialogTitle className='bg-[#032538] text-white flex justify-between items-center'>
                    <div className='text-2xl'>Downloads</div>
                    <span onClick={handleCloseDownload} className="cursor-pointer text-2xl font-thin"><IoClose /></span>
                </DialogTitle>
                <DialogContent>
                    <div className='flex flex-col gap-4 p-4'>
                        <div className='flex justify-between items-center gap-24'>
                            <p className='text-2xl'>Bill</p>
                            <div className='flex gap-4'>
                                {row.bill ?
                                    <>
                                        <Button variant="outlined" onClick={handleViewBill} style={{
                                            // backgroundColor: "#021018",
                                            color: "#021018",
                                            border: "1px solid #021018",
                                            padding: "0.5rem 2rem",
                                            // boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)"
                                        }}>View</Button>
                                        <Button variant="contained" onClick={handleViewBill} style={{
                                            backgroundColor: "#021018",
                                            color: "white",
                                            padding: "0.5rem 2rem",
                                            // boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)"
                                        }}>Download</Button>
                                    </>
                                    :
                                    <>
                                        <span className='text-lg'>Bill Not Found</span>
                                    </>
                                }
                            </div>
                        </div>
                        <div className='flex justify-between items-center gap-24'>
                            <p className='text-2xl'>Sanction Letter</p>
                            <div className='flex gap-4'>
                                {row.sanctionLetter ?
                                    <>
                                        <Button variant="outlined" onClick={handleViewSanctionLetter} style={{
                                            // backgroundColor: "#021018",
                                            color: "#021018",
                                            border: "1px solid #021018",
                                            padding: "0.5rem 2rem",
                                            // boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)"
                                        }}>View</Button>
                                        <Button variant="contained" onClick={handleViewSanctionLetter} style={{
                                            backgroundColor: "#021018",
                                            color: "white",
                                            padding: "0.5rem 2rem",
                                            // boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)"
                                        }}>Download</Button>
                                    </>
                                    :
                                    <>
                                        <span className='text-lg'>Sanction Letter Not Found</span>
                                    </>
                                }
                            </div>
                        </div>
                        <div className='flex justify-between items-center gap-24'>
                            <p className='text-2xl'>Purchase order</p>
                            <div className='flex gap-4'>
                                {row.purchaseOrder ?
                                    <>
                                        <Button variant="outlined" onClick={handleViewPurchaseOrder} style={{
                                            // backgroundColor: "#021018",
                                            color: "#021018",
                                            border: "1px solid #021018",
                                            padding: "0.5rem 2rem",
                                            // boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)"
                                        }}>View</Button>
                                        <Button variant="contained" onClick={handleViewPurchaseOrder} style={{
                                            backgroundColor: "#021018",
                                            color: "white",
                                            padding: "0.5rem 2rem",
                                            // boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)"
                                        }}>Download</Button>
                                    </>
                                    :
                                    <>
                                        <span className='text-lg'>Purchase order Not Found</span>
                                    </>
                                }
                            </div>
                        </div>
                        <div className='flex justify-between items-center gap-24'>
                            <p className='text-2xl'>Inspection Report</p>
                            <div className='flex gap-4'>
                                {row.inspectionReport ?
                                    <>
                                        <Button variant="outlined" onClick={handleViewInspectionReport} style={{
                                            // backgroundColor: "#021018",
                                            color: "#021018",
                                            border: "1px solid #021018",
                                            padding: "0.5rem 2rem",
                                            // boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)"
                                        }}>View</Button>
                                        <Button variant="contained" onClick={handleViewInspectionReport} style={{
                                            backgroundColor: "#021018",
                                            color: "white",
                                            padding: "0.5rem 2rem",
                                            // boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)"
                                        }}>Download</Button>
                                    </>
                                    :
                                    <>
                                        <span className='text-lg'>Inspection report Not Found</span>
                                    </>
                                }
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            <Dialog open={openEditModal} onClose={handleCloseEditModal}>
                <DialogTitle className='bg-[#032538] text-white'>
                    <div className='text-2xl'>Add an Item</div>
                </DialogTitle>
                <DialogContent>
                    {/* <DialogContentText>
                        To subscribe to this website, please enter your email address here. We
                        will send updates occasionally.
                    </DialogContentText> */}
                    <div className='mt-8 flex flex-col gap-8'>
                        <TextField id="item-name" label="Item Name" variant="outlined" value={itemName} onChange={(e) => setItemName(e.target.value)} />
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <div className='grid grid-cols-2 gap-8'>
                                <TextField id="quantity" label="Quantity" variant="outlined" value={editQuantity} onChange={(e) => setEditQuantity(e.target.value)} />
                                <DateTimePicker
                                    renderInput={(props) => <TextField {...props} />}
                                    label="Bill Date"
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
                                    <MenuItem value={"Coding Club"}>Coding Club</MenuItem>
                                    <MenuItem value={"Design Club"}>Design Club</MenuItem>
                                    <MenuItem value={"Electronics Club"}>Electronics Club</MenuItem>
                                    <MenuItem value={"Robotics Club"}>Robotics Club</MenuItem>
                                    <MenuItem value={"Consulting & Analytics"}>Consulting & Analytics</MenuItem>
                                    <MenuItem value={"E-Cell"}>E-Cell</MenuItem>
                                    <MenuItem value={"Aeromodelling Club"}>Aeromodelling Club</MenuItem>
                                    <MenuItem value={"IITG.Ai Club"}>IITG.Ai Club</MenuItem>
                                    <MenuItem value={"Automobile Club"}>Automobile Club</MenuItem>
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
                                    <MenuItem value={"Major Equipment"}>Major Equipment</MenuItem>
                                    <MenuItem value={"Minor Equipment"}>Minor Equipment</MenuItem>
                                    <MenuItem value={"Consumables"}>Consumables</MenuItem>
                                    <MenuItem value={"Furniture"}>Furniture</MenuItem>
                                    <MenuItem value={"Books"}>Books</MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                        <div className='grid grid-cols-3 gap-4 items-center'>
                            <p className='font-medium'>Sanction letter:</p>
                            <input className="col-span-2 text-sm font-medium text-gray-600 file:bg-[#1976D2] file:border-none file:text-white file:px-6 file:py-2 file:rounded-[4px] drop-shadow-md file:cursor-pointer font-[Roboto] file:text-sm file:uppercase file:font-medium cursor-pointer file:hover:bg-[#2368ac]" type="file" name="sanctionLetter" id="sanctionLetter" onChange={(e) => setSanctionLetter(e.target.files[0])} />
                            <p className='font-medium'>Purchase Order:</p>
                            <input className="col-span-2 text-sm font-medium text-gray-600 file:bg-[#1976D2] file:border-none file:text-white file:px-6 file:py-2 file:rounded-[4px] drop-shadow-md file:cursor-pointer font-[Roboto] file:text-sm file:uppercase file:font-medium cursor-pointer file:hover:bg-[#2368ac]" type="file" name="purchaseOrder" id="purchaseOrder" onChange={(e) => setPurchaseOrder(e.target.files[0])} />
                            <p className='font-medium'>Bill:</p>
                            <input className="col-span-2 text-sm font-medium text-gray-600 file:bg-[#1976D2] file:border-none file:text-white file:px-6 file:py-2 file:rounded-[4px] drop-shadow-md file:cursor-pointer font-[Roboto] file:text-sm file:uppercase file:font-medium cursor-pointer file:hover:bg-[#2368ac]" type="file" name="bill" id="bill" onChange={(e) => setBill(e.target.files[0])} />
                            <p className='font-medium'>Inspection Report:</p>
                            <input className="col-span-2 text-sm font-medium text-gray-600 file:bg-[#1976D2] file:border-none file:text-white file:px-6 file:py-2 file:rounded-[4px] drop-shadow-md file:cursor-pointer font-[Roboto] file:text-sm file:uppercase file:font-medium cursor-pointer file:hover:bg-[#2368ac]" type="file" name="inspectionReport" id="inspectionReport" onChange={(e) => setInspectionReport(e.target.files[0])} />
                        </div>
                        <div>
                            <p className='font-medium'>Stockbook details:</p>
                            <div className="grid grid-cols-3 gap-8 mt-2">
                                <TextField id="registerNo" label="Register No" variant="outlined" value={registerNo} onChange={(e) => setRegisterNo(e.target.value)} />
                                <TextField id="pageNo" label="Page No" variant="outlined" value={pageNo} onChange={(e) => setPageNo(e.target.value)} />
                                <TextField id="serialNo" label="Serial No" variant="outlined" value={serialNo} onChange={(e) => setSerialNo(e.target.value)} />
                            </div>
                        </div>
                        {/* <TextField required id="remarks" label="Quantity" variant="outlined" /> */}
                        <TextField id="remarks" label="Remarks/Description" variant="outlined" value={editRemarks} onChange={(e) => setEditRemarks(e.target.value)} />
                    </div>
                </DialogContent>
                <DialogActions className='m-4 flex gap-2'>
                    <Button variant="outlined" onClick={handleCloseEditModal} style={{
                        // backgroundColor: "#021018",
                        color: "#021018",
                        border: "1px solid #021018",
                        padding: "0.5rem 2rem",
                        // boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)"
                    }}>Cancel</Button>
                    <Button variant="contained" onClick={() => handleSubmitEditModal(row._id, row.itemDocument)} style={{
                        backgroundColor: "#021018",
                        color: "white",
                        padding: "0.5rem 2rem",
                        // boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)"
                    }}>Submit</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment >
    );
}

export default function EnhancedTable(props) {
    const { data, setData, user } = props;
    // console.log(data);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('name');

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const query = props.query;
    const clubName = props.clubName;
    const catName = props.catName;
    const startDate = props.startDate;
    const endDate = props.endDate;

    const searchFunc = (query, clubName, catName, startDate = 0, endDate = Date.now()) => {
        var results = data.filter((item) => {
            if (item.name)
                return item.name.toLowerCase().includes(query.toLowerCase());
            return false;
        });

        if (typeof clubName === "object" && clubName.length !== 0) {
            results = results.filter((item) => {
                if (typeof (item.ownedBy) === "string" && typeof (item.heldBy) === "string") {
                    for (let j = 0; j < clubName.length; j++) {
                        const element = clubName[j].toLowerCase();
                        if ((item.ownedBy.toLowerCase() === element) || (item.heldBy.toLowerCase() === element)) {
                            return true;
                        }
                    }
                }
                return false;
            });
        }

        if (typeof catName === "object" && catName.length !== 0) {

            results = results.filter((item) => {
                if (typeof (item.category) === "string") {
                    for (let j = 0; j < catName.length; j++) {
                        const element = catName[j].toLowerCase();
                        if (item.category.toLowerCase() === element) {
                            return true;
                        }
                    }
                }
                return false;
            });
        }

        if (typeof (startDate) === 'number' && typeof (endDate) === 'number') {

            results = results.filter((item) => {
                if (startDate <= item.purchasedOn && item.purchasedOn <= endDate) {
                    return true;
                } else {
                    return false;
                }
            });
        }
        return results;

    };

    let searchResults = [];
    if (data.length !== 0) {
        searchResults = searchFunc(query, clubName, catName, startDate, endDate);
    }

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ width: '100%' }}>
                <Paper sx={{ width: '100%', mb: 2 }}>
                    <TableContainer>
                        <Table
                            sx={{ minWidth: 750 }}
                            aria-labelledby="tableTitle"
                            size='medium'
                        >
                            <EnhancedTableHead
                                order={order}
                                orderBy={orderBy}
                                onRequestSort={handleRequestSort}
                                rowCount={searchResults.length}
                            />
                            <TableBody>
                                {stableSort(searchResults, getComparator(order, orderBy))
                                    .map((row, index) =>
                                        <Row key={index} row={row} index={index} data={searchResults} setData={setData} user={user} />
                                    )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
                {searchResults.length === 0 ?
                    <>
                        <p className='text-white/80 text-2xl text-center font-medium'> No records to display</p>
                    </>
                    : ""}
            </Box>
        </ThemeProvider>
    );
}