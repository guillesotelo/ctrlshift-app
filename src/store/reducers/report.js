import { createReducer, createAsyncThunk } from "@reduxjs/toolkit"
import { 
    createReport,
    getAllReports
} from "../services/reduxServices";

const initialState = {
    report: null,
}

export const getReports = createAsyncThunk('GET_MOVEMENTS', getAllReports)
export const saveReport = createAsyncThunk('SAVE_MOVEMENT', createReport)

const reportReducer = createReducer(initialState, {
  [getReports.fulfilled]: (state, action) => action.payload,
  [saveReport.fulfilled]: (state, action) => action.payload
});

export default reportReducer;