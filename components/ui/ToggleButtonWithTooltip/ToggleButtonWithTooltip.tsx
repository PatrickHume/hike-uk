import Tooltip from '@mui/material/Tooltip';
import ToggleButton, { ToggleButtonProps } from '@mui/material/ToggleButton';
import React, { MouseEvent } from "react";

type ToggleButtonWithTooltipProps = {
  tooltipText: string;
  disabled?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  value: any; // Add the 'value' prop
} & ToggleButtonProps;

const ToggleButtonWithTooltip: React.FC<ToggleButtonWithTooltipProps> = ({
  tooltipText,
  disabled=false,
  onClick,
  value, // Destructure the 'value' prop
  ...other
}) => {
  const adjustedButtonProps: ToggleButtonProps = {
    disabled: disabled,
    onClick: disabled ? undefined : onClick,
    value: value, // Pass the 'value' prop
  };

  return (
    <Tooltip title={tooltipText}>
      <ToggleButton {...other} {...adjustedButtonProps} />
    </Tooltip>
  );
};

ToggleButtonWithTooltip.displayName = 'ToggleButtonWithTooltip';
export default ToggleButtonWithTooltip;
