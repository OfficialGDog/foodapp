import React, { useState, useEffect, useCallback } from "react";
import { geodatabase } from "../../firebase/config";
import {
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  DialogActions,
  Grid,
  FormControlLabel,
  withStyles,
  Checkbox
} from "@material-ui/core/";

export default function Modal({ open, dietaryconditions, title, marker, children, onClose }) {

  const [markerRef, setMarkerRef] = useState(null);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if(!open) return
    if(!marker) return
    setMarkerRef(marker.id);
  },[open]);

  useEffect(() => {
    if(!marker) return
    if(!dietaryconditions) return
    setSelected(dietaryconditions.filter((item) => marker.tags.some((item2) => item.name === item2 )));
  },[marker, dietaryconditions])

  const handleCheck = useCallback((e) => {
    try {
      let { id } = JSON.parse(e.target.value);
      let condition;
  
      condition = dietaryconditions.find((item) => item.path === id)
  
      if(condition) {
        if(e.target.checked) {
          setSelected((current) => [...current, condition]);
        } else {
          setSelected(selected.filter((item) => item.path !== id)); 
        }
      }
    } catch (error) {
      console.error(error);
    }
  },[dietaryconditions, selected]);

  const saveMarkerTags = useCallback(() => {
    if(!markerRef) return

    geodatabase.restaurants.doc(markerRef).set({tags: selected.map(item => item.name)}, {merge: true});

  }, [selected]);

  const CustomCheckbox = withStyles({
    root: {
      color: "#009688",
      '&$checked': {
        color: "#009688",
      },
    },
    checked: {},
  })((props) => <Checkbox color="default" {...props} />);
  
  return (
    <div>
      <Dialog
        open={open}
        onClose={onClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent dividers={dietaryconditions ? true : false} >
          {dietaryconditions ? (
            <Grid container spacing={1}>
            {dietaryconditions.map((condition, index) => (
                <Grid container item={true} key={index} xs={12} md={4} lg={4}>
                    <FormControlLabel
                      className="dietarytag"
                      label={condition.name}
                      control={<CustomCheckbox value={JSON.stringify({id: condition.path})} checked={selected.some((item) => item.path === condition.path || item.name === condition.name)} onChange={handleCheck} />}
                    />
                  </Grid>         
              ))}
              </Grid>
          ) : (
            <DialogContentText id="alert-dialog-description">
              {children}
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <div onClick={saveMarkerTags}>
          <Button onClick={onClose} color="primary" autoFocus>
            Ok
          </Button>
          </div>
        </DialogActions>
      </Dialog>
    </div>
  );
}
