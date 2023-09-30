import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import { visuallyHidden } from '@mui/utils';
import Collapse from '@mui/material/Collapse';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { styled } from '@mui/material/styles';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios';
import Snackbar from '@mui/material/Snackbar';
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
        id: 'requestedBy',
        numeric: false,
        disablePadding: false,
        label: 'Requested By',
    },
    {
        id: 'quantity',
        numeric: true,
        disablePadding: false,
        label: 'Quantity',
    },
    {
        id: 'duration',
        numeric: true,
        disablePadding: false,
        label: 'Duration',
    },
    {
        id: 'requestStatus',
        numeric: false,
        disablePadding: false,
        label: 'Request Status',
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
    const { row, index, data, setData } = props;
    const labelId = `enhanced-table-checkbox-${index}`;
    const [open, setOpen] = React.useState(false);
    const [openAcceptMsg, setOpenAcceptMsg] = useState(false);
    const [openRejectMsg, setOpenRejectMsg] = useState(false);
    const [openErrorMsg, setOpenErrorMsg] = useState(false);
    const [openNetworkErrorMsg, setOpenNetworkErrorMsg] = useState(false);
    const [openRemoveMsg, setOpenRemoveMsg] = useState(false);

    const handleClickRemoveMsg = () => {
        setOpenRemoveMsg(true);
    };

    const handleCloseRemoveMsg = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpenRemoveMsg(false);
    };

    const handleClickAcceptMsg = () => {
        setOpenAcceptMsg(true);
    };

    const handleCloseAcceptMsg = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpenAcceptMsg(false);
    };
    const handleClickRejectMsg = () => {
        setOpenRejectMsg(true);
    };

    const handleCloseRejectMsg = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpenRejectMsg(false);
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

    const handleClickNetworkErrorMsg = () => {
        setOpenNetworkErrorMsg(true);
    };

    const handleCloseNetworkErrorMsg = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpenNetworkErrorMsg(false);
    };

    const formatDate = (date) => {
        const time = new Date(parseInt(date)).toLocaleTimeString('en-IN', { hour: "2-digit", minute: "2-digit", hour12: true });
        const day = new Date(parseInt(date)).toLocaleString('en-IN', { year: "numeric", month: "short", day: "numeric", time: "12" });
        const outputDate = time + ', ' + day;
        return outputDate;
    }

    const handleAcceptRequest = (id) => {
        if (window.confirm("Are you sure want to approve this request") === true) {
            try {
                const options = { "requestId": id }
                axios.put("http://localhost:8080/request/accept", options)
                    .then((res) => {
                        // console.log(res.data);
                        const newData = data.map(el => {
                            if (el._id === id) {
                                const newItem = { ...el, requestStatus: "Approved" };
                                return newItem;
                            }
                            else
                                return el;
                        });
                        setData(newData);
                        handleClickAcceptMsg();
                    }).catch((e) => {
                        handleClickErrorMsg();
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

    const handleRejectRequest = (id) => {
        if (window.confirm("Are you sure want to decline this request") === true) {
            try {
                const options = { "requestId": id }
                axios.put("http://localhost:8080/request/reject", options)
                    .then((res) => {
                        // console.log(res.data);
                        const newData = data.map(el => {
                            if (el._id === id) {
                                const newItem = { ...el, requestStatus: "Declined" };
                                return newItem;
                            }
                            else
                                return el;
                        });
                        setData(newData);
                        handleClickRejectMsg();
                    }).catch((e) => {
                        handleClickErrorMsg();
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

    const handleRemoveRequest = (id) => {
        if (window.confirm("Are you sure want to delete this request") === true) {
            try {
                axios.delete("http://localhost:8080/request/delete", {
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
                        handleClickRemoveMsg();
                    }).catch((e) => {
                        handleCloseErrorMsg();
                        // alert('Unable to delete item. Please try again later');
                    });
            }
            catch (e) {
                handleClickNetworkErrorMsg();
            }
            setOpen(false);
        } else {
            console.log("Remove request cancelled");
        }
    }

    const formatDuration = (data) => {
        const numberOfHours = Math.ceil(data / (3600 * 1000));
        let Days = Math.floor(numberOfHours / 24);
        let Remainder = numberOfHours % 24;
        let Hours = Math.floor(Remainder);
        let output = "";
        if (Days > 0) {
            output = Days;
            output += (Days === 1) ? " Day " : " Days ";
        }
        if (Hours > 0) {
            output += Hours;
            output += (Hours === 1) ? " Hour " : " Hours ";
        }
        return output;
    }

    const vertical = 'top'
    const horizontal = 'center';

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
                <TableCell align="left">{row.requestedBy}</TableCell>
                <TableCell align="center">{row.quantity}</TableCell>
                <TableCell align="center">{formatDuration(row.outTime - row.inTime)}</TableCell>
                <TableCell align="left"><p className={`italic font-medium ${row.requestStatus === 'Pending' ? "text-gray-500" : (row.requestStatus === 'Approved' ? "text-green-500" : "text-red-500")}`}>{row.requestStatus}</p></TableCell>
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
                    <Snackbar open={openAcceptMsg} autoHideDuration={6000} onClose={handleCloseAcceptMsg} anchorOrigin={{ vertical, horizontal }}>
                        <Alert onClose={handleCloseAcceptMsg} severity="success" sx={{ width: '100%' }}>
                            Request Accepted!
                        </Alert>
                    </Snackbar>
                    <Snackbar open={openRejectMsg} autoHideDuration={6000} onClose={handleCloseRejectMsg} anchorOrigin={{ vertical, horizontal }}>
                        <Alert onClose={handleCloseRejectMsg} severity="warning" sx={{ width: '100%' }}>
                            Request Rejected!
                        </Alert>
                    </Snackbar>
                    <Snackbar open={openRemoveMsg} autoHideDuration={6000} onClose={handleCloseRemoveMsg} anchorOrigin={{ vertical, horizontal }}>
                        <Alert onClose={handleCloseRemoveMsg} severity="success" sx={{ width: '100%' }}>
                            Request updated successfully!
                        </Alert>
                    </Snackbar>
                    <Snackbar open={openErrorMsg} autoHideDuration={6000} onClose={handleCloseErrorMsg} anchorOrigin={{ vertical, horizontal }}>
                        <Alert onClose={handleCloseErrorMsg} severity="error" sx={{ width: '100%' }}>
                            Unable to process request. Please try again later!
                        </Alert>
                    </Snackbar>
                    <Snackbar open={openNetworkErrorMsg} autoHideDuration={6000} onClose={handleCloseNetworkErrorMsg} anchorOrigin={{ vertical, horizontal }}>
                        <Alert onClose={handleCloseNetworkErrorMsg} severity="error" sx={{ width: '100%' }}>
                            Network error. Please try again later!
                        </Alert>
                    </Snackbar>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <div className="flex px-8 py-8 gap-16">
                            <div className='w-full flex flex-col gap-4'>
                                <div>
                                    <span className='font-medium mr-4'>Remarks : </span>
                                    <span> {row.remarks || <span className='italic'>No remarks</span>}</span>
                                </div>
                                <div>
                                    <span className='font-medium mr-4'>Time of Request : </span>
                                    <span> {formatDate(row.requestTime)}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 w-3/4 items-end">
                                <div>
                                    <span className='font-medium mr-4'>In Time : </span>
                                    <span> {formatDate(row.inTime)}</span>
                                </div>
                                <div>
                                    <span className='font-medium mr-4'>Out Time : </span>
                                    <span> {formatDate(row.outTime)}</span>
                                </div>
                                <div className="p-2 flex">
                                    <div className="mt-4 flex">
                                        {row.requestStatus === 'Pending' ?
                                            (<React.Fragment>
                                                <button type="submit" className="bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded" onClick={() => handleRejectRequest(row._id)}>Decline</button>
                                                <button type="submit" className="bg-transparent hover:bg-green-500 text-green-700 ml-6 font-semibold hover:text-white py-2 px-4 border border-green-500 hover:border-transparent rounded" onClick={() => handleAcceptRequest(row._id)}>Approve</button>
                                            </React.Fragment>)
                                            :
                                            (row.requestStatus === 'Approved' ?
                                                (<React.Fragment>
                                                    <button type="submit" className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" onClick={() => handleRemoveRequest(row._id)}>Item Returned</button>
                                                    <button type="submit" className="bg-transparent hover:bg-red-500 text-red-700 ml-6 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded">Force Decline</button>
                                                </React.Fragment>) :
                                                "")}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}

export default function RequestReceived(props) {
    const { data, setData } = props;
    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('calories');

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

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
                                rowCount={data.length}
                            />
                            <TableBody>
                                {stableSort(data, getComparator(order, orderBy))
                                    .map((row, index) =>
                                        <Row key={index} row={row} index={index} data={data} setData={setData} />
                                    )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
                {data.length === 0 ?
                    <>
                        <p className='text-white/80 text-2xl text-center font-medium'> No records to display</p>
                    </>
                    : ""}
            </Box>
        </ThemeProvider>
    );
}