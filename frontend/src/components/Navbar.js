import React, { useState } from 'react'
import { Link, useNavigate } from "react-router-dom";
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Select, MenuItem, InputLabel, Snackbar } from '@mui/material';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { IoSearch } from "react-icons/io5";
import { FaAngleDown } from "react-icons/fa";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { FaTrashAlt } from "react-icons/fa";
import axios from 'axios';
import MuiAlert from '@mui/material/Alert';
import Input from "./Input";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function Navbar(props) {
  const { data, setData } = props;
  const [openAddModal, setOpenAddModal] = useState(false);
  const [purchaseDate, setPurchaseDate] = useState(dayjs());
  const [ownedBy, setOwnedBy] = useState('');
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [remarks, setRemarks] = useState('');
  const [quantity, setQuantity] = useState('');
  const [pageNo, setPageNo] = useState('');
  const [serialNo, setSerialNo] = useState('');
  const [registerNo, setRegisterNo] = useState('');
  const text = props.textContent;
  const navigate = useNavigate();
  const [openSuccessMsg, setOpenSuccessMsg] = useState(false);
  const [openErrorMsg, setOpenErrorMsg] = useState(false);

  const [bill, setBill] = useState(null);
  const [sanctionLetter, setSanctionLetter] = useState(null);
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [inspectionReport, setInspectionReport] = useState(null);
  const [formValues, setFormValues] = useState([]);

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

  const handleOwnership = (event) => {
    setOwnedBy(event.target.value);
  };
  const handleCategory = (event) => {
    setCategory(event.target.value);
  };

  const handleClickOpenAddModal = () => {
    setOpenAddModal(true);
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
  };

  function filter(e) {
    props.onQuery(e.target.value);
  }

  const handleSubmit = async () => {
    const lastItem = {
      "name": itemName,
      "category": category,
      "quantity": quantity,
      "ownedBy": ownedBy,
      "purchasedOn": purchaseDate.toDate().getTime(),
      "status": "Available",
      "remarks": remarks,
    }
    const newArr = formValues.map(item => {
      return (
        {
          "name": item.itemName,
          "category": item.category,
          "quantity": item.quantity,
          "ownedBy": ownedBy,
          "purchasedOn": purchaseDate.toDate().getTime(),
          "status": "Available",
          "remarks": remarks,
        }
      )
    });
    const itemArr = [...newArr, lastItem];
    const options = {
      "itemsList": itemArr,
      "bill": bill,
      "sanctionLetter": sanctionLetter,
      "purchaseOrder": purchaseOrder,
      "inspectionReport": inspectionReport,
      "pageNo": pageNo,
      "serialNo": serialNo,
      "registerNo": registerNo,
      "bookings": []
    };
    console.log(options);
    try {
      // alert("Backend not updated yet");
      axios.post("http://localhost:8080/item", options, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }).then((res) => {
        handleCloseAddModal();
        handleClickSuccessMsg();
        // alert('Item added successfully');
      }).catch((e) => {
        handleCloseAddModal();
        handleClickErrorMsg();
        // alert('Unable to add item. Please try again later');

      });
    }
    catch (e) {
      handleCloseAddModal();
      handleClickErrorMsg();
      // alert('Unable to add item. Please try again later');
    }

  }

  const onChangeHandler = (e, index) => {
    const values = [...formValues];
    values[index][e.target.name] = e.target.value;
    console.log(values);
    setFormValues(values);
  };

  const handleAddField = () => {
    const values = [...formValues];
    values.push({
      itemName: itemName,
      category: category,
      quantity: quantity
    });
    setItemName("");
    setQuantity("");
    setCategory("");
    setFormValues(values);
  };

  const deleteItemField = (index) => {
    const values = [...formValues];
    values.splice(index, 1);
    setFormValues(values);
  }

  const handleLogout = () => {
    localStorage.removeItem('rim-jwt');
    navigate('/login');
  }

  const vertical = 'top'
  const horizontal = 'center';

  return (
    <>
      <Snackbar open={openSuccessMsg} autoHideDuration={6000} onClose={handleCloseSuccessMsg} anchorOrigin={{ vertical, horizontal }}>
        <Alert onClose={handleCloseSuccessMsg} severity="success" sx={{ width: '100%' }}>
          Item added successfully!
        </Alert>
      </Snackbar>
      <Snackbar open={openErrorMsg} autoHideDuration={6000} onClose={handleCloseErrorMsg} anchorOrigin={{ vertical, horizontal }}>
        <Alert onClose={handleCloseErrorMsg} severity="error" sx={{ width: '100%' }}>
          Unable to add item. Please try again later!
        </Alert>
      </Snackbar>
      <div className="flex items-center bg-[#032538] p-5 justify-between">
        <div className="flex gap-5 items-center text-white/70">
          <Link to="/" className="text-xl px-4 font-bold text-white">
            RIM PORTAL
          </Link>
          <Link to="/" className="hover:text-white">
            <p className={`cursor-pointer px-4 py-2 ${text ? "" : "bg-white/20"}`}>Home</p>
          </Link>
          <div className="dropdown group text-white/70 hover:text-white">
            <p className={`cursor-pointer flex items-center justify-center gap-4 px-4 py-2 ${text ? " bg-white/20" : ""}`}>{text ? text : "Requests"} <FaAngleDown /></p>

            <div className="dropdown-content z-10 absolute bg-[#032538] hidden group-hover:block shadow-xl">
              <Link to="/sent" className="block px-4 py-3 text-white/70 hover:text-white hover:bg-[#217cb0]">
                Requests - Sent
              </Link>
              <Link to="/received" className="block px-4 py-3 text-white/70 hover:text-white hover:bg-[#217cb0]">
                Requests - Received
              </Link>
            </div>
          </div>
          <div className="cursor-pointer px-4 py-2 hover:text-white" onClick={handleLogout}>
            Logout
          </div>
        </div>
        <div className="flex gap-6">
          <div className="flex">
            <input
              className="searchbar border-none outline-none text-sm px-5 py-2 w-72"
              type="text"
              placeholder="Search item"
              onChange={filter}
            ></input>
            <div className="flex justify-center items-center bg-[#A2D5F2] px-4 cursor-pointer text-xl text-[#032538] hover:bg-[#52a6de]">
              <IoSearch />
            </div>
          </div>
          <button className="cursor-pointer flex justify-center items-center text-sm text-[#032538] font-medium bg-[#A2D5F2] hover:bg-[#52a6de] px-5" onClick={handleClickOpenAddModal}>Add item +</button>
        </div>
      </div>
      <Dialog open={openAddModal} onClose={handleCloseAddModal}>
        <DialogTitle className='bg-[#032538] text-white'>
          <div className='text-2xl'>Add an Item</div>
        </DialogTitle>
        <DialogContent>
          <div className='mt-8 flex flex-col gap-8'>
            {formValues.map((obj, index) => (
              <>
                <div className='flex justify-between'>
                  <p className='font-medium'>{`Item ${index + 1}`}</p>
                  <div className="cursor-pointer text-red-600 hover:underline flex w-fit items-center gap-2" onClick={() => deleteItemField(index)}>Delete item <FaTrashAlt /></div>
                </div>
                <Input key={index} index={index} objValue={obj} onChangeHandler={onChangeHandler} />
              </>
            ))}
            <p className='font-medium'>{`Item ${formValues.length + 1}`}</p>
            <TextField id="item-name" label="Item Name" name="itemName" variant="outlined" value={itemName} onChange={(e) => setItemName(e.target.value)} />
            <div className='grid grid-cols-2 gap-8'>
              <TextField id="quantity" label="Quantity" name="quantity" variant="outlined" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
              <FormControl fullWidth>
                <InputLabel id="category">Category</InputLabel>
                <Select
                  id="category"
                  name="category"
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
            <div className="flex justify-end">
              <div className="flex cursor-pointer text-blue-600 hover:underline w-fit items-center gap-2 text-base" onClick={handleAddField}>Add more item <AiOutlinePlusCircle /></div>
            </div>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
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
            <TextField id="remarks" label="Remarks/Description" variant="outlined" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
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
          <Button variant="contained" onClick={handleSubmit} style={{
            backgroundColor: "#021018",
            color: "white",
            padding: "0.5rem 2rem",
            // boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)"
          }}>Submit</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Navbar;
