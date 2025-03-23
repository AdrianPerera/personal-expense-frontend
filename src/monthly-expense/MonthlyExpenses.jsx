import { memo, useEffect, useRef, useState } from "react";
import { MonthMap } from "../common/MonthMap.jsx";
import "./MonthlyExpenses.css";
import { CurrencyMap } from "../common/CurrencyMap.jsx";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import AddExpense from "./AddExpense.jsx";
import { AgCharts } from "ag-charts-react";
import { FaArrowLeft, FaArrowRight, FaPlus, FaUpload } from "react-icons/fa";

ModuleRegistry.registerModules([AllCommunityModule]);

const MonthlyExpenses = () => {
  const [month, setMonth] = useState("December");
  const [year, setYear] = useState(2024);
  const [expenses, setExpenses] = useState([]);
  const [selected, setSelected] = useState([]);
  const [toggleAddExpense, setToggleAddExpense] = useState(false);
  const gridRef = useRef(null);
  const [chartOptions, setChartOptions] = useState({
    // Data: Data to be displayed in the chart
    data: [],
    title: {
      text: "Expense Composition",
    },
    series: [
      {
        type: "pie",
        angleKey: "amount",
        calloutLabelKey: "expenseType",
        sectorLabelKey: "amount",
        sectorLabel: {
          color: "white",
          fontWeight: "bold",
          formatter: ({ value }) =>
            `${CurrencyMap["RS"]} ${new Intl.NumberFormat().format(value)}`,
        },
      },
    ],
  });

  function formatAmount(params) {
    return `${CurrencyMap[params.data.currency]} ${new Intl.NumberFormat().format(params.value)}`;
  }

  let chartColumnDefs = [
    { headerName: "", field: "no", checkboxSelection: true },
    {
      headerName: "Date",
      field: "createdAt",
      valueFormatter: (params) => {
        return formatDate(params.value);
      },
    },
    { headerName: "Type", field: "expenseType" },
    { headerName: "Description", field: "description" },
    {
      headerName: "Amount",
      field: "amount",
      valueFormatter: (params) => {
        return formatAmount(params);
      },
    },
    {
      headerName: "Action",
      field: "action",
      cellRenderer: (params) => (
        <>
          <button
            title="Edit"
            style={{ margin: "0 5px" }}
            onClick={() => handleEdit(params.data.id)}
          >
            <AiOutlineEdit />
          </button>
          <button
            title="Delete"
            style={{ margin: "0 5px" }}
            onClick={() => handleDelete(params.data.id)}
          >
            <AiOutlineDelete />
          </button>
        </>
      ),
    },
  ];
  const [columnDefs] = useState(chartColumnDefs);

  useEffect(() => {
    console.log(
      `MonthlyExpenses component rendered with month: ${month} and year: ${year}`,
    );
    fetchExpenses();
    fetchExpenseCompositionData();
  }, [month, year]);

  const selectAll = () => {
    const ids = expenses.map((expense) => expense.id);
    setSelected(ids);
    gridRef.current.api.selectAll();
  };

  const clearSelection = () => {
    setSelected([]);
    gridRef.current.api.deselectAll();
  };

  const fetchExpenses = async () => {
    try {
      console.log(`month: ${month}, year: ${year}`);
      const getUrl = `http://localhost:3000/expenses?month=${MonthMap[month]}&year=${year}`;
      const response = await fetch(getUrl);
      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  const fetchExpenseCompositionData = async () => {
    try {
      console.log(`month: ${month}, year: ${year}  fetching composition data`);
      const getUrl = `http://localhost:3000/expenses/groupBy?month=${MonthMap[month]}&year=${year}&groupBy=expenseType`;
      const response = await fetch(getUrl);
      let data = await response.json();
      //data has to be in the form of expenseType and amount
      const formattedData = data.map((item) => ({
        expenseType: item.expenseType,
        amount: item._sum.amount,
      }));

      setChartOptions((prevOptions) => ({
        ...prevOptions,
        data: formattedData,
        title: {
          text: `Expense Composition ${month} ${year}`,
        },
      }));
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  const formatDate = (dateString) => {
    return dateString.split("T")[0];
  };

  const handleEdit = (id) => {
    console.log(`Edit expense with id: ${id} `);
  };

  const handleDelete = async (id) => {
    const deleteUrl = `http://localhost:3000/expenses/id/${id}`;
    const response = await fetch(deleteUrl, {
      method: "DELETE",
    });

    const selectedData = gridRef.current.api.getSelectedRows();
    response.json().then(() => {
      gridRef.current.api.applyTransaction({ remove: selectedData });
      handleRefreshChart();
    });
  };

  const deleteSelected = async () => {
    const deleteUrl = `http://localhost:3000/expenses?${selected.map((id) => `ids=${id}`).join("&")}`;
    const response = await fetch(deleteUrl, {
      method: "DELETE",
    });
    response.json().then(() => {
      fetchExpenses();
      setSelected([]);
      handleRefreshChart();
    });
  };

  const handleAddExpense = () => {
    setToggleAddExpense((toggleAddExpense) => !toggleAddExpense);
  };

  const handleAdd = (expense) => {
    console.log("Adding expense:", expense, `month: ${month}, year: ${year}`);
    if (MonthMap[month] === expense.month && year === expense.year) {
      gridRef.current.api.applyTransaction({ add: [expense] });
    }
  };

  const handleRefreshChart = () => {
    console.log("Refreshing chart");
    fetchExpenseCompositionData();
  };

  const handleNextMonth = () => {
    const monthIndex = Object.keys(MonthMap).indexOf(month);
    if (monthIndex === 11) {
      setMonth(Object.keys(MonthMap)[0]);
      setYear(year + 1);
    } else {
      setMonth(Object.keys(MonthMap)[monthIndex + 1]);
    }
  };

  const handlePreviousMonth = () => {
    const monthIndex = Object.keys(MonthMap).indexOf(month);
    if (monthIndex === 0) {
      setMonth(Object.keys(MonthMap)[11]);
      setYear(year - 1);
    } else {
      setMonth(Object.keys(MonthMap)[monthIndex - 1]);
    }
  };

  const handleUploadFileButton = () => {};

  return (
    <div>
      <div className="dropdowns-container">
        <div className="dropdown">
          <button
            className="add-expense-button"
            title={"Previous Month"}
            onClick={() => handlePreviousMonth()}
          >
            <FaArrowLeft />
          </button>
        </div>
        <div className="dropdown">
          <label htmlFor="month">Month:</label>
          <select
            value={month}
            onChange={(event) => setMonth(event.target.value)}
          >
            {Object.keys(MonthMap).map((monthName) => (
              <option key={monthName} value={monthName}>
                {monthName}
              </option>
            ))}
          </select>
        </div>
        <div className="dropdown">
          <label htmlFor="year">Year:</label>
          <input
            style={{ textAlign: "center" }}
            type="number"
            value={year}
            onChange={(event) => setYear(parseInt(event.target.value, 10))}
          />
        </div>
        <div className="dropdown">
          <button
            className="add-expense-button"
            title={"Next Month"}
            onClick={() => handleNextMonth()}
          >
            <FaArrowRight />
          </button>
        </div>
      </div>
      <div style={{ display: "flex" }}>
        <div style={{ flex: 2, margin: "10px" }}>
          <div className={"button-container"}>
            {selected.length > 0 && (
              <button
                className="add-expense-button"
                onClick={() => deleteSelected()}
              >
                Delete {selected.length > 0 && <span>:{selected.length}</span>}
              </button>
            )}
            {selected.length > 0 && (
              <button
                className="add-expense-button"
                onClick={() => clearSelection()}
              >
                Clear {selected.length > 0 && <span>:{selected.length}</span>}
              </button>
            )}
            {selected.length > 0 && (
              <button
                className="add-expense-button"
                onClick={() => selectAll()}
              >
                Select All
              </button>
            )}
            <button
              className="add-expense-button"
              onClick={() => handleAddExpense()}
            >
              Add Expense
              <FaPlus />
            </button>
            <button
              className="add-expense-button"
              onClick={() => handleUploadFileButton()}
            >
              Upload File
              <FaUpload />
            </button>
          </div>

          <div
            className="ag-theme-alpine"
            style={{ height: 600, width: "100%" }}
          >
            <AgGridReact
              ref={gridRef}
              rowData={expenses}
              columnDefs={columnDefs}
              rowSelection="multiple"
              onSelectionChanged={() => {
                const selectedNodes = gridRef.current.api.getSelectedNodes();
                const selectedIds = selectedNodes.map((node) => node.data.id);
                setSelected(selectedIds);
              }}
            />
          </div>
        </div>
        <div style={{ flex: 1, margin: "10px" }}>
          <div className={"button-container"}>
            <button
              className="add-expense-button"
              onClick={() => handleRefreshChart()}
            >
              refresh
            </button>
          </div>
          <div>
            <AgCharts
              style={{
                height: 600,
                border: "3px solid white",
                borderRadius: "8px",
              }}
              options={chartOptions}
            />
          </div>
        </div>
      </div>
      {toggleAddExpense && (
        <div>
          <AddExpense handleAdd={handleAdd} />
        </div>
      )}
    </div>
  );
};

export default memo(MonthlyExpenses);
