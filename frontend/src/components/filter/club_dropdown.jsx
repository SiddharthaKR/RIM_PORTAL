import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import styled from "styled-components";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 500,
    },
  },
};

const names = [
  'Coding club',
  'C&A',
  'FEC',
  'E-Cell',
  'Robotics',
  'Aeromodelling',
  'IITG.Ai',
  'Automobile',
  '4i Labs',
];

function ClubSelector(props) {
  const { clubName, setClubName } = props;

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setClubName(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  return (
    <div>
      <FormControl sx={{ m: 0, width: 1 }}>
        <InputLabel id="demo-multiple-checkbox-label">Tag</InputLabel>
        <Select
          labelId="demo-multiple-checkbox-label"
          id="demo-multiple-checkbox"
          multiple
          value={clubName}
          onChange={handleChange}
          input={<OutlinedInput label="Tag" />}
          renderValue={(selected) => selected.join(', ')}
          MenuProps={MenuProps}
        >
          {names.map((name) => (
            <MenuItem key={name} value={name}>
              <Checkbox checked={clubName.indexOf(name) > -1} />
              <ListItemText primary={name} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}

const Heading = styled.div`

  color: #032538;
  font-weight: 500;
  font-size: 18px;
  line-height: 16px;
  /* identical to box height, or 89% */

  letter-spacing: 0.32px;
  margin : 16px 0px;

`;

export default function ClubSelect(props) {
  const { clubName, setClubName } = props;
  return (
    <div>
      <Heading>Club Name</Heading>
      <ClubSelector clubName={clubName} setClubName={setClubName}></ClubSelector>
    </div>

  )

}