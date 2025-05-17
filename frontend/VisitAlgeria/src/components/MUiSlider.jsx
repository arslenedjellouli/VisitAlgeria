import * as React from "react";
import PropTypes from "prop-types";
import Slider, { SliderThumb } from "@mui/material/Slider";
import { styled } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import { Box } from "@mui/material";

function ValueLabelComponent(props) {
  const { children, value } = props;

  return (
    <Tooltip enterTouchDelay={0} placement="top" title={value}>
      {children}
    </Tooltip>
  );
}

ValueLabelComponent.propTypes = {
  children: PropTypes.element.isRequired,
  value: PropTypes.node,
};

const AirbnbSlider = styled(Slider)(({ theme }) => ({
  color: "#6CC3C5",
  height: 50,
  width: 600,
  "& .MuiSlider-track": {
    border: "none",
  },
  "& .MuiSlider-thumb": {
    height: 48,
    width: 48,
    backgroundColor: "#6CC3C5",
    border: "8px solid #FFFFFF",
    "&:hover": {
      boxShadow: "0 0 0 8px #6CC3C533",
    },
    "& .airbnb-bar": {
      height: 9,
      width: 1,
      backgroundColor: "currentColor",
      marginLeft: 1,
      marginRight: 1,
    },
  },

  "& .MuiSlider-track": {
    height: 20,
  },
  "& .MuiSlider-rail": {
    color: "#C0DBFB",
    opacity: 1,
    height: 20,
    borderRadius: 10,
    ...theme.applyStyles("dark", {
      color: "#bfbfbf",
      opacity: undefined,
    }),
  },

  "& .MuiSlider-valueLabel": {
    lineHeight: 1.2,
    fontSize: 22,
    background: "unset",
    padding: 0,
    width: 72,
    height: 53,
    borderRadius: "20px 20px 20px 20px",
    backgroundColor: "#6CC3C5",
    transformOrigin: "bottom left",
    transform: "translate(50%, -130%) scale(0)",
    "&::before": {
      width: 15,
      height: 15,
    },
    "&.MuiSlider-valueLabelOpen": {
      transform: "translate(0%, -160%) scale(1)",
    },
  },
}));

function AirbnbThumbComponent(props) {
  const { children, ...other } = props;
  return (
    <SliderThumb {...other}>
      {children}
      <span className="airbnb-bar" />
      <span className="airbnb-bar" />
      <span className="airbnb-bar" />
    </SliderThumb>
  );
}

AirbnbThumbComponent.propTypes = {
  children: PropTypes.node,
};

export default function CustomizedSlider({ onChange }) {
  return (
    <AirbnbSlider
      valueLabelDisplay="on"
      slots={{ thumb: AirbnbThumbComponent }}
      getAriaLabel={(index) =>
        index === 0 ? "Minimum price" : "Maximum price"
      }
      defaultValue={[3, 4]}
      onChange={(e, newValue) => onChange(newValue)}
      min={1}
      max={5}
    />
  );
}
