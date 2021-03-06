import React, { useEffect, useState } from "react";
import {
  TableHead,
  TablePagination,
  TableContainer,
  TableRow,
  Table,
  TableBody,
  TableCell,
  Zoom,
  Typography,
  Tooltip,
  TableSortLabel,
  Card,
  CardContent,
  Button,
  Box,
} from "@material-ui/core";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteDocument,
  getDocumentList,
  getSingleDocument,
  titleSortAsc,
  titleSortDesc,
} from "redux/actions/document-action";
import { DocDetails } from "components/doc-details";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { ConformationModal } from "components/conformation-modal";
import { isLoadingFalse, isLoadingTrue } from "redux/actions/app-loader";
import { useIsLoading } from "hooks/useIsLoading";
import { LoadingData } from "components/loading-data";
import { delayedAction } from "utils/utils";

function DocList() {
  const history = useHistory();
  const dispatch = useDispatch();

  const { documentList = [] } = useSelector((state) => state.documentReducer);
  const isAppLoading = useIsLoading();

  const [addDoc, setAddDoc] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(2);
  const [titleSortingtype, setTitleingtype] = useState(null);

  useEffect(() => {
    dispatch(getDocumentList());
  }, [dispatch]);

  if (isAppLoading) {
    return <LoadingData />;
  }

  if (addDoc) {
    return <DocDetails {...{ setAddDoc }} />;
  }

  const getTableData = () => {
    if (documentList.length === 0) {
      return (
        <TableRow hover>
          <TableCell className="empty-table" colSpan="4">
            No document found
          </TableCell>
        </TableRow>
      );
    }
    return (
      rowsPerPage > 0
        ? documentList.slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage
          )
        : documentList
    ).map(({ id, title, description, isEdited }, index) => (
      <TableRow
        hover
        key={id}
        onClick={() => {
          history.push(`/home/${id}`);
          dispatch(getSingleDocument(id));
        }}
      >
        <TableCell className="pl-4">{index + 1 + page * rowsPerPage}</TableCell>
        <TableCell className="edite-icon">
          {title}
          {isEdited && (
            <Tooltip
              TransitionComponent={Zoom}
              title="Edited document"
              placement="top"
            >
              <EditOutlinedIcon fontSize="small" />
            </Tooltip>
          )}
        </TableCell>
        <Tooltip TransitionComponent={Zoom} title={description} placement="top">
          <TableCell>{description}</TableCell>
        </Tooltip>
        <TableCell>
          <Button
            className="select-table-btn"
            onClick={(e) => {
              e.stopPropagation();
              setEditId(id);
              setDeleteModal(true);
            }}
          >
            <DeleteOutlinedIcon />
          </Button>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <React.Fragment>
      <Box className="d-flex">
        <Typography variant="h6" component="div">
          Document List <span>({documentList.length})</span>
        </Typography>

        <Button
          color="primary"
          variant="contained"
          onClick={() => setAddDoc(true)}
        >
          Add Document
        </Button>
      </Box>
      <Card className="tabel-list">
        <CardContent style={{ padding: "0" }}>
          <TableContainer>
            <Table size="medium" className="select-table">
              <TableHead>
                <TableRow>
                  <TableCell className="pl-4">#</TableCell>
                  <TableCell sortDirection={false}>
                    <TableSortLabel
                      active={
                        titleSortingtype === "asc" ||
                        titleSortingtype === "desc"
                      }
                      direction={titleSortingtype === "asc" ? "desc" : "asc"}
                      onClick={() => {
                        setTitleingtype(
                          titleSortingtype === "asc" ? "desc" : "asc"
                        );
                        if (titleSortingtype === "asc") {
                          dispatch(titleSortAsc());
                        }
                        if (titleSortingtype === "desc") {
                          dispatch(titleSortDesc());
                        }
                      }}
                    >
                      Title
                    </TableSortLabel>
                  </TableCell>

                  <TableCell>Description</TableCell>
                  <TableCell>Delete</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>{getTableData()}</TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[2, 5, 10, 20]}
            component="div"
            count={documentList.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(event.target.value);
              setPage(0);
            }}
          />
        </CardContent>
      </Card>
      {deleteModal && (
        <ConformationModal
          onClickYes={() => {
            delayedAction({
              startLoader: () => {
                dispatch(isLoadingTrue());
              },
              onSucces: () => {
                dispatch(isLoadingFalse());
                dispatch(deleteDocument(editId));
                setDeleteModal(false);
                setEditId(null);
              },
              setToast: "Document Deleted",
            });
          }}
          isOpen={deleteModal}
          modalHeader="Are you sure you want to Delete Document"
          onClose={() => {
            setDeleteModal(false);
            setEditId(null);
          }}
        />
      )}
    </React.Fragment>
  );
}

export { DocList };
