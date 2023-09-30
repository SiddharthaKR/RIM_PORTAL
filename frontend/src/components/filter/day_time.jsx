import { useState } from 'react';
import dayjs from 'dayjs';
import TextField from '@mui/material/TextField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import styled from "styled-components";


const Wrap = styled.div`

    display: flex;
    flex-direction: row;
    gap: 8px;

`;

function DayTimeSelector(props) {
  var [date1, setDate] = useState(dayjs("01/01/2000", 'DD/MM/YYYY'));
  const handleChange = (date) => {
    setDate(date);
    props.list(date.toDate().getTime());
    // console.log(event);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Wrap>
        <DatePicker
          label="From Date"
          value={date1}
          inputFormat="DD/MM/YYYY"
          onChange={(date1) => handleChange(date1)}
          renderInput={(params) => <TextField {...params} />}
        />
      </Wrap>

    </LocalizationProvider>
  );
}

function DayTimeSelector2(props) {

  var [date2, setDate] = useState(dayjs());
  const handleChange = (date) => {
    setDate(date);
    props.list2(date.toDate().getTime());
  };
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Wrap>
        <DatePicker
          label="To Date"
          value={date2}
          inputFormat="DD/MM/YYYY"
          onChange={(date) => handleChange(date)}
          renderInput={(params) => <TextField {...params} />}
        />
      </Wrap>

    </LocalizationProvider>
  );
}


const Heading = styled.div`

  color: #032538;
  font-weight: 500;
  font-size: 18px;
  line-height: 16px;
  /* identical to box height, or 89% */

  letter-spacing: 0.32px;
  margin : 16px 0px 24px 0px;

`;

export default function DayTime(props) {
  const { setStartDate, setEndDate } = props;
  return (
    <div>
      <Heading>Purchased On</Heading>
      <Wrap>
        <DayTimeSelector list={setStartDate}></DayTimeSelector>
        <DayTimeSelector2 list2={setEndDate}></DayTimeSelector2>
      </Wrap>

    </div>

  )

}