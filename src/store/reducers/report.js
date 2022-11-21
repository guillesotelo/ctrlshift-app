import { createReducer, createAsyncThunk } from "@reduxjs/toolkit"
import { 
    createReport,
    getAllReports,
    updateReportData
} from "../services/reduxServices";

const initialState = {
    report: null,
}

export const getReports = createAsyncThunk('GET_REPORTS', getAllReports)
export const saveReport = createAsyncThunk('SAVE_REPORT', createReport)
export const updateReport = createAsyncThunk('UPDATE_REPORT', updateReportData)

const reportReducer = createReducer(initialState, {
  [getReports.fulfilled]: (state, action) => action.payload,
  [saveReport.fulfilled]: (state, action) => action.payload,
  [updateReport.fulfilled]: (state, action) => action.payload
});

export default reportReducer;