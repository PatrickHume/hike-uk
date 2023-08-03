import React              from 'react';
import Dialog             from '@mui/material/Dialog';
import DialogActions      from '@mui/material/DialogActions';
import DialogContent      from '@mui/material/DialogContent';
import DialogContentText  from '@mui/material/DialogContentText';
import DialogTitle        from '@mui/material/DialogTitle';
import useMediaQuery      from '@mui/material/useMediaQuery';
import { useTheme }       from '@mui/material/styles';

interface MenuDialogProps {
  open          : boolean;
  handleClose  : () => void;
  title         : React.ReactNode;
  text          : React.ReactNode;
  children      : React.ReactNode;
}

/* 
This is a dialog box that covers the screen, 
providing options specified in the children attribute.

This class is provided as a minor abstraction of the material ui dialog class.
*/
const MenuDialog: React.FC<MenuDialogProps> = ({
  open,
  handleClose,
  title,
  text,
  children
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog
      fullScreen={fullScreen}
      open={open}
      onClose={handleClose}
      aria-labelledby="responsive-dialog-title"
    >

      {/* The dialog box title */}
      <DialogTitle id="responsive-dialog-title">
        <div className="text-black font-semibold text-lg italic">{title}</div>
      </DialogTitle>

      {/* The dialog box text contents */}
      <DialogContent>
        <DialogContentText>
          {text}
        </DialogContentText>
      </DialogContent>

      {/* The buttons used to interact with the dialog box */}
      <DialogActions>
        {children}
      </DialogActions>

    </Dialog>
  );
};

export default MenuDialog;
