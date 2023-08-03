import { useState, Children, CSSProperties } from 'react';
import { styled } from '@mui/material/styles';
import s from './ButtonGrid.module.css';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  '& .MuiToggleButtonGroup-grouped': {
    marginLeft: 5,
    marginRight: 5,
    marginTop: 2.5,
    marginBottom: 2.5,
    border: 0,
    '&.Mui-disabled': {
      border: 0,
    },
    '&:not(:first-of-type)': {
      borderRadius: theme.shape.borderRadius,
    },
    '&:first-of-type': {
      borderRadius: theme.shape.borderRadius,
    },
    
  },
}));

const ButtonGrid = ({ func, defaults=undefined, children, viewSize, style=undefined, exclusive=false, enforced=false} : { func? : ((selected: Array<string>) => void) | ((selected: string) => void), defaults?: Array<string> | string | undefined, children: React.ReactNode, viewSize?: 'small' | 'medium' | 'large', style?: CSSProperties | undefined, exclusive?: boolean, enforced?: boolean }) => {
  let setSize;
  if (viewSize === 'small') {
    setSize = 2;
  } else if (viewSize === 'medium') {
    setSize = 3;
  } else {
    setSize = 4;
  }

  const childrenArray = Children.toArray(children);

  const sets = [];
  for (let i = 0; i < childrenArray.length; i += setSize) {
    const set = childrenArray.slice(i, i + setSize);
    sets.push(set);
  }

  if(defaults === undefined){
    if(exclusive) defaults = '';
    else          defaults = [];
  }

  const [formats, setFormats] = useState(defaults);
  
  const handleFormat = (
    event: React.MouseEvent<HTMLElement>,
    newFormats: string[] & string,
  ) => {
    if(enforced && !newFormats) return;
    setFormats(newFormats);
    if(func !== undefined){
      func(newFormats);
    }
  };

  return (

    <Box className={s['button-panel']} style={style}>

      <Stack spacing={0}>
      {sets.map((set, index) => (
        <StyledToggleButtonGroup
          key={index} // Add the key prop with a unique value
          exclusive={exclusive}
          size="small"
          value={formats}
          onChange={handleFormat}
          aria-label="text formatting"
        >
          {set}
        </StyledToggleButtonGroup>
      ))}
      </Stack>
     
    </Box>
  );
};

ButtonGrid.displayName = 'ButtonGrid';
export default ButtonGrid;
