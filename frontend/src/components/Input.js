import React from 'react'
import { TextField, MenuItem, FormControl, InputLabel, Select } from '@mui/material';

const Input = (props) => {
    const { objValue, onChangeHandler, index } = props;
    const { itemName, quantity, category } = objValue;
    return (
        <>
            <TextField id="item-name" label="Item Name" name="itemName" variant="outlined" value={itemName} onChange={e => onChangeHandler(e, index)} />
            <div className='grid grid-cols-2 gap-8'>
                <TextField id="quantity" label="Quantity" name="quantity" variant="outlined" value={quantity} onChange={e => onChangeHandler(e, index)} />
                <FormControl fullWidth>
                    <InputLabel id="category">Category</InputLabel>
                    <Select
                        id="category"
                        name="category"
                        value={category}
                        label="Category"
                        onChange={e => onChangeHandler(e, index)}
                    >
                        <MenuItem value={"Major Equipment"}>Major Equipment</MenuItem>
                        <MenuItem value={"Minor Equipment"}>Minor Equipment</MenuItem>
                        <MenuItem value={"Consumables"}>Consumables</MenuItem>
                        <MenuItem value={"Furniture"}>Furniture</MenuItem>
                        <MenuItem value={"Books"}>Books</MenuItem>
                    </Select>
                </FormControl>
            </div>
        </>
    )
}

export default Input