import React, {
  useState,
  useEffect,
  useContext,
  createContext,
  useRef,
  useCallback,
  useReducer,
} from "react";
import { Form, Card, Button } from "react-bootstrap";
import { firestore } from "../firebase/config";
import { useAuth } from "./AuthContext";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  TableContainer,
  Table,
  Paper,
  TableRow,
  TableFooter,
  TablePagination,
  TableBody,
  TableCell,
  FormControlLabel,
  Checkbox,
  withStyles
} from "@material-ui/core";

import { Button as MDButton } from "@material-ui/core";
import "./FoodContext.css";

const FoodContext = createContext();

const ACTIONS = {
  ADDLIST: "add-list",
  ADD: "add-object",
  UPDATE: "update-object",
  DELETE: "delete-object",
  CLEAR: "clear-list",
  SET: "set-list",
};

export const useFood = () => {
  return useContext(FoodContext);
};

// Provider component that wraps your app and makes auth object ...
// ... available to any child component that calls useFood().
export function ProvideFood({ children }) {
  const food = useProvideFood();
  return <FoodContext.Provider value={food}>{children}</FoodContext.Provider>;
}

function useProvideFood() {
  const [categories, dispatchCategory] = useReducer(reducer, []);
  const [foods, dispatchFood] = useReducer(reducer, []);
  const [dietaryConditions, dispatchDC] = useReducer(reducer, []);
  const [isLoading, setLoading] = useState(true);
  const [isSaved, setSaved] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, dispatchSelect] = useReducer(reducer, []);
  const [expanded, setExpanded] = useState(false);
  const [hide, setHide] = useState(true);
  const { user, setUserData } = useAuth();
  const listeners = useRef([]);

  function reducer(state, action) {
    switch (action.type) {
      case ACTIONS.ADDLIST:
        return [...state, ...action.payload];
      case ACTIONS.ADD:
        return [...state, action.payload];
      case ACTIONS.UPDATE:
        return state.map((item) =>
          item.path === action.payload.path
            ? { ...item, ...action.payload }
            : item
        );
      case ACTIONS.SET:
        return [...action.payload];
      case ACTIONS.DELETE:
        return state.filter((item) => item.path !== action.payload.path);
      case ACTIONS.CLEAR:
        return [];
      default:
        return state;
    }
  }

  const CustomCheckbox = withStyles({
    root: {
      color: "#009688",
      '&$checked': {
        color: "#009688",
      },
    },
    checked: {},
  })((props) => <Checkbox color="default" {...props} />);
  

  const getUserSelectedOptions = useCallback(() => {
    let foodlist = [],
      conditionlist = [];

    if (user.foods)
      foodlist = foods.filter((item) =>
        user.foods.some((item2) => item2 === item.name)
      );

    if (user.intolerance)
      conditionlist = dietaryConditions.filter((item) =>
        user.intolerance.some((item2) => item2 === item.name)
      );

    return [...foodlist, ...conditionlist];
  }, [user, foods, dietaryConditions]);

  const handleCheck = useCallback(
    (e) => {
      try {
        let { food, condition } = JSON.parse(e.target.value);

        const isChecked = e.target.checked;

        food = foods.find((item) => item.path === food);

        condition = dietaryConditions.find((item) => item.path === condition);

        if (food)
          return dispatchSelect({
            type: isChecked ? ACTIONS.ADD : ACTIONS.DELETE,
            payload: food,
          });

        if (condition)
          return dispatchSelect({
            type: isChecked ? ACTIONS.ADD : ACTIONS.DELETE,
            payload: condition,
          });
      } catch (error) {
        console.error(error.message);
      }
    },
    [foods, dietaryConditions]
  );

  const handleSave = useCallback(async ()  => {
    try {
      const selectedFoods = selected
        .filter((item) => item.path.split("/")[0] === "foods")
        .map((item) => item.name);
      const selectedConditions = selected
        .filter((item) => item.path.split("/")[0] === "dietaryconditions")
        .map((item) => item.name);

      const data = await setUserData(user, {
        foods: selectedFoods,
        intolerance: selectedConditions,
        isNew: false
      });

      setSaved(true);

    } catch (error) {
      console.error(error);
    }
  }, [user, selected, setUserData]);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleChangePage = (event, newPage) => {
    if (newPage >= 0) return setPage(newPage + 1);
    return setPage(newPage);
  };

  function updateProfileButton(props) {
    if (isLoading) return "Loading...";
    return (
      <>
        <Button
          variant="success"
          disabled={isSaved}
          size="lg"
          type="button"
          onClick={handleSave}
        >
          {props.label ? props.label : !isSaved ? "Save" : "Saved"}
        </Button>
      </>
    );
  }

  function DietaryConditions() {
    if (isLoading) return "Loading...";
    return (
      <Card>
        <Card.Header
          as="h2"
          className="text-center"
          style={{ backgroundColor: "rgba(0,0,0,0)", border: "none" }}
        >
          Dietary Conditions
        </Card.Header>
        <Card.Body
          className="text-center"
          style={{ paddingTop: "0px", maxWidth: "800px" }}
        >
          Tell us about your dietary conditions.
          <Form className="mt-4">
              <Grid container spacing={1}>
              {dietaryConditions.map((condition, index) => (
                  <Grid container item={true} key={index} xs={12} md={4} lg={4}>
                      <FormControlLabel
                          label={condition.name}
                          control={<CustomCheckbox value={JSON.stringify({condition: condition.path})} checked={selected.some((checked) => checked.path === condition.path)} onChange={handleCheck} disabled={isLoading} />}
                      />
                  </Grid>         
              ))}
                
             </Grid>
          </Form>
        </Card.Body>
      </Card>
    );
  }

  function FilterDietaryConditions() {
    if (isLoading) return "Loading...";

    return (
      <Grid container spacing={1}>
        {dietaryConditions.slice(0, hide ? 3 : dietaryConditions.length).map((condition, index) => (
         <Grid container item={true} key={index} xs={12} sm={3}>
             <FormControlLabel
                 label={condition.name}
                 control={<CustomCheckbox value={JSON.stringify({condition: condition.path})} checked={selected.some((checked) => checked.path === condition.path)} onChange={handleCheck} disabled={isLoading} />}
             />
         </Grid>         
        ))}
         <Grid container item={true} xs={12} sm={3}>
        <div style={{alignSelf: "center"}}>
         <MDButton
          size="medium"
          variant="outlined"
          disabled={isLoading}
          style={{bottom: "4px"}}
          type="button"
          onClick={() => setHide(!hide)}>{hide ? "Show more" : "Show less"}
        </MDButton>
        </div>
         </Grid>
      </Grid>
    );
  }

  function FoodCategories() {
    return (
      <Card>
        <Card.Header
          as="h2"
          className="text-center"
          style={{ backgroundColor: "rgba(0,0,0,0)", border: "none" }}
        >
          My Food Profile
        </Card.Header>
        <Card.Body
          className="text-center"
          style={{ paddingTop: "0px", maxWidth: "800px", padding: "0px" }}
        >
          Tell us about which foods you can't eat.
          <Form className="mt-4">
            <TableContainer component={Paper} style={{ minHeight: "315px" }}>
              <Table aria-label="category table">
                <TableBody>
                  {categories
                    .slice(
                      (page - 1) * rowsPerPage,
                      (page - 1) * rowsPerPage + rowsPerPage
                    )
                    .map((row, index) => (
                      <TableRow key={index}>
                        <TableCell component="th" scope="row">
                          <Accordion disabled={!(foods.some((food) => food.category === row.name))} expanded={expanded === `panel${index}`} onChange={handleChange(`panel${index}`)}>
                            <AccordionSummary
                              aria-controls="panel1bh-content"
                              id="panel1bh-header">
                              {row.name}
                            </AccordionSummary>
                            <AccordionDetails>
                              <Grid container spacing={1}>
                                <Grid container item xs={12}>
                              {foods.map((food, index2) => (food.category === row.name) && (
                                 <Grid item={true} key={index2} xs={12} md={4} lg={4}>
                                    <FormControlLabel
                                      label={food.name}
                                      control={<CustomCheckbox value={JSON.stringify({food: food.path})} checked={selected.some((checked) => checked.path === food.path)} onChange={handleCheck} disabled={isLoading} />}
                                      />
                                 </Grid>
                                ))}
                              </Grid>
                              </Grid>
                            </AccordionDetails>
                          </Accordion>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[5, { value: -1, label: "All" }]}
                      count={categories.length}
                      rowsPerPage={rowsPerPage}
                      page={page - 1}
                      SelectProps={{
                        inputProps: { "aria-label": "categories per page" },
                        native: true,
                      }}
                      onChangePage={handleChangePage}
                      onChangeRowsPerPage={(event) => {
                        setRowsPerPage(parseInt(event.target.value, 10));
                        setPage(1);
                      }}
                    />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </Form>
        </Card.Body>
      </Card>
    );
  }

  const attachListener = (listener) => listeners.current.push(listener);

  const dettachListeners = () => listeners.current.forEach((listener) => listener());

  const updateLastUpdated = () => {
    try {
      localStorage.setItem("updated", new Date());
    } catch (error) {
      console.error(error);
    }
  }

  const isDateLessThanOneHourAgo = (date) => {
    const HOUR = 1000 * 60 * 60;
    const oneHourAgo = Date.now() - (HOUR * 1);
    return date > oneHourAgo
  }

  const getCache = () => {
    try {
      let foodsCache = JSON.parse(localStorage.getItem("foods"));
      let categoryCache = JSON.parse(localStorage.getItem("categories"));
      let conditionCache = JSON.parse(localStorage.getItem("conditions"));
      const lastupdated = localStorage.getItem("updated");

      if(!foodsCache) foodsCache = [];
      if(!categoryCache) categoryCache = [];
      if(!conditionCache) conditionCache = [];

      if(!(isDateLessThanOneHourAgo(new Date(lastupdated)))) {
        localStorage.clear();
        return false;
      }

      if(typeof foodsCache === "object") dispatchFood({type: ACTIONS.ADDLIST, payload: foodsCache })
      if(typeof categoryCache === "object") dispatchCategory({type: ACTIONS.ADDLIST, payload: categoryCache })
      if(typeof conditionCache === "object") dispatchDC({type: ACTIONS.ADDLIST, payload: conditionCache })

      return (foodsCache.length && categoryCache.length && conditionCache.length)

    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {

    dispatchFood({ type: ACTIONS.CLEAR });
    dispatchCategory({ type: ACTIONS.CLEAR });
    dispatchDC({ type: ACTIONS.CLEAR });
    dispatchSelect({ type: ACTIONS.CLEAR });

    if(getCache()) return console.log(`Serving dietary data from cache`);

    console.log("Fetching Dietary Data");

    const unsubscribe1 = firestore
      .collection("foods")
      .limit(30) // This means the user can view up to 30 changes
      .orderBy('name', 'desc')
      .onSnapshot(
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {

            updateLastUpdated();

            if (change.type === "removed") {
              dispatchFood({
                type: ACTIONS.DELETE,
                payload: { path: change.doc.ref.path },
              });
              return dispatchSelect({
                type: ACTIONS.DELETE,
                payload: { path: change.doc.ref.path },
              });
            }

            const data = change.doc.data();

            if (change.type === "modified") {
              dispatchFood({
                type: ACTIONS.UPDATE,
                payload: { ...data, path: change.doc.ref.path },
              });
              return dispatchSelect({
                type: ACTIONS.UPDATE,
                payload: { ...data, path: change.doc.ref.path },
              });
            }

            if (change.type === "added")
              return dispatchFood({
                type: ACTIONS.ADD,
                payload: { ...data, path: change.doc.ref.path },
              });
          });
        },
        (error) => {
          console.error(error);
        }
      );

    const unsubscribe2 = firestore
      .collection("categories")
      .limit(30) // This means the user can view up to 30 changes
      .orderBy('name', 'desc')
      .onSnapshot(
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {

            updateLastUpdated();

            if (change.type === "removed") {
              dispatchCategory({
                type: ACTIONS.DELETE,
                payload: { path: change.doc.ref.path },
              });
              return dispatchSelect({
                type: ACTIONS.DELETE,
                payload: { path: change.doc.ref.path },
              });
            }

            const data = change.doc.data();

            if (change.type === "modified") {
              dispatchCategory({
                type: ACTIONS.UPDATE,
                payload: { ...data, path: change.doc.ref.path },
              });
              return dispatchSelect({
                type: ACTIONS.UPDATE,
                payload: { ...data, path: change.doc.ref.path },
              });
            }

            if (change.type === "added")
              return dispatchCategory({
                type: ACTIONS.ADD,
                payload: { ...data, path: change.doc.ref.path },
              });
          });
        },
        (error) => {
          console.error(error);
        }
      );

    const unsubscribe3 = firestore
      .collection("dietaryconditions")
      .limit(30) // This means the user can view up to 30 changes
      .orderBy('name', 'desc')
      .onSnapshot(
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {

            updateLastUpdated();

            if (change.type === "removed") {
              dispatchDC({
                type: ACTIONS.DELETE,
                payload: { path: change.doc.ref.path },
              });
              return dispatchSelect({
                type: ACTIONS.DELETE,
                payload: { path: change.doc.ref.path },
              });
            }

            const data = change.doc.data();

            if (change.type === "modified") {
              dispatchDC({
                type: ACTIONS.UPDATE,
                payload: { ...data, path: change.doc.ref.path },
              });
              return dispatchSelect({
                type: ACTIONS.UPDATE,
                payload: { ...data, path: change.doc.ref.path },
              });
            }

            if (change.type === "added")
              return dispatchDC({
                type: ACTIONS.ADD,
                payload: { ...data, path: change.doc.ref.path },
              });
          });
        },
        (error) => {
          console.error(error);
        }
      );

    attachListener(unsubscribe1);
    attachListener(unsubscribe2);
    attachListener(unsubscribe3);

    // Cleanup subscription on unmount

    return () => dettachListeners();

  }, []);

  useEffect(() => {

    dispatchSelect({ type: ACTIONS.SET, payload: getUserSelectedOptions() });

    try {
      if(!foods.length || !categories.length || !dietaryConditions.length) return
      localStorage.setItem("foods", JSON.stringify(foods));
      localStorage.setItem("conditions", JSON.stringify(dietaryConditions));
      localStorage.setItem("categories", JSON.stringify(categories));
    } catch (error) {
      console.error(error);
    }

    setLoading(false);

  }, [foods, categories, dietaryConditions]);

  // the useEffect() below runs whenever the user selects / unselects a checkbox
  useEffect(() => {
    // Re-Enable the save button if the user makes a change
    setSaved(false);

  }, [selected]);

  // Return the user object and auth methods
  return {
    selected,
    dietaryConditions,
    isSaved,
    DietaryConditions,
    FoodCategories,
    FilterDietaryConditions,
    updateProfileButton,
  };
}
