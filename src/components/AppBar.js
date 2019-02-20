import React from "react"
import { AppBar, Toolbar, IconButton, Typography, Button } from "@material-ui/core";
import blockies from "ethereum-blockies-png";
import SettingIcon from "@material-ui/icons/Settings";
import { Link } from 'react-router-dom'

const noAddrBlocky = require("../assets/noAddress.png");
const connext = require("../assets/Connext.svg")

const AppBarComponent = props => (
  <AppBar position="sticky" elevation="0" color="secondary" style={{ paddingTop: "2%" }}>
    <Toolbar>
      <IconButton color="inherit" variant="contained" component={Link} to="/deposit">
        <img
          src={props.address ? blockies.createDataURL({ seed: props.address }) : noAddrBlocky}
          alt=""
          style={{ width: "40px", height: "40px", marginTop: "5px" }}
        />
        <Typography variant="body2" noWrap style={{ width: "75px", marginLeft: "6px", color: "#c1c6ce" }}>
          <span>{props.address}</span>
        </Typography>
      </IconButton>
      <IconButton color="inherit" variant="contained" component={Link} to="/">
        <img
          src={connext}
          alt=""
          style={{ width: "40px", height: "40px", marginTop: "5px" }}
        />
      </IconButton>
      <Typography variant="h6" style={{ flexGrow: 1 }} />
      <IconButton color="inherit" variant="contained" component={Link} to="/settings">
        <SettingIcon />
      </IconButton>
    </Toolbar>
  </AppBar>
);

export default AppBarComponent