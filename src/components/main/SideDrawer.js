import React, {useState, useEffect} from 'react';
import { useHistory } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FaHeart } from "react-icons/fa";
import { BsPersonFill, BsSearch } from "react-icons/bs";
import {
    Typography,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText
  } from "@material-ui/core";
import {ExitToApp, Info, ChevronLeft} from '@material-ui/icons';


export default function SideDrawer({visible, onClose}) {
    const [open, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(-1);
    const history = useHistory();
    const auth = useAuth();

    useEffect(() => {
        switch(history.location.pathname) {
            case "/":
                return setSelected(0);
            case "/myfavourites":
                return setSelected(1);
            case "/myprofile":
                return setSelected(2);
            case "/about":
                return setSelected(3);
            default:
                return;
        }
    },[]);

    useEffect(() => {
        setIsOpen(!!visible);
      }, [visible]);

    const handleNavigation = (index) => {
        switch (index) {
        case 0:
            if (history.location.pathname !== "/") history.push("/");
            return onClose();
        case 1:
            if (history.location.pathname !== "/myfavourites") history.push("/myfavourites");
            return onClose();
        case 2:
            if (history.location.pathname !== "/myprofile") history.push("/myprofile");
            return onClose();
        case 3:
            if (history.location.pathname !== "/about") history.push("/about");
            return onClose();
        case 4:
            return auth.logout().then(() => history.push("/login"));
        default:
        return;
      }
    };
      
    return (
        <Drawer
        variant="persistent"
        anchor="left"
        open={open}>
           <div style={{ display: "flex", alignItems: 'center', justifyContent: 'flex-end', padding: '0px 8px' }}><Typography variant="h6" style={{flexGrow: 1, margin: "20px 0px 0px 30px"}}>Food Passport</Typography>
           <IconButton onClick={onClose}>
           <ChevronLeft/>
          </IconButton>
           </div>

        <div role="presentation" style={{width: "250px"}} >
        <List>
          {['Search', 'Favourites', 'My Profile', 'Developer', 'Logout'].map((text, index) => (
            <ListItem className={index === selected ? "selected" : ""} button key={text} onClick={() => { handleNavigation(index); }} style={{padding: "8px 16px"}}>
              <ListItemIcon style={{justifyContent: "center", color: "inherit"}} >{index === 0 && (<BsSearch />)}{index === 1 && (<FaHeart/>)}{index === 2 && (<BsPersonFill/>)}{index === 4 && (<ExitToApp/>)}{index === 3 && (<Info/>)}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
        </div>
      </Drawer>
    )
}