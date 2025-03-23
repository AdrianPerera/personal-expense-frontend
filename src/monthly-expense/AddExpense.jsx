import { useEffect, useState } from "react";
import { MonthMap } from "../common/MonthMap.jsx";
import { FaPlusCircle, FaToggleOff, FaToggleOn } from "react-icons/fa";
import Modal from "../common/Modal.jsx";
import "../yearly-expense/YearlyExpenses.css";

const AddExpense = ({ handleAdd }) => {
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [expenseType, setExpenseType] = useState("Accessories");
  const [currencies, setCurrencies] = useState([]);
  const [currency, setCurrency] = useState("RS");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [past, setPast] = useState(false);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchExpenseTypes = async () => {
      try {
        const input = `http://localhost:3000/expenses/getCustomDropdowns?field=expenseType`;
        const response = await fetch(input);
        const data = await response.json();
        setExpenseTypes(data);
      } catch (error) {
        console.error("Error fetching expenseTypes:", error);
      }
    };

    const fetchCurrencyTypes = async () => {
      try {
        const input = `http://localhost:3000/expenses/getCustomDropdowns?field=currency`;
        const response = await fetch(input);
        const data = await response.json();
        setCurrencies(data);
      } catch (error) {
        console.error("Error fetching currencyTypes:", error);
      }
    };

    fetchExpenseTypes();
    fetchCurrencyTypes();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!amount) newErrors.amount = "Amount is required.";
    if (!expenseType) newErrors.expenseType = "Expense type is required.";
    if (!currency) newErrors.currency = "Currency is required.";
    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setShowModal(true);
      return;
    }
    setErrors({});
    setShowModal(false);

    const newExpense = {
      expenseType,
      description,
      amount: parseFloat(amount),
      currency,
      ...(past && { month: MonthMap[month], year: parseInt(year, 10) }),
    };
    const link = past
      ? "http://localhost:3000/expenses/past"
      : "http://localhost:3000/expenses";

    try {
      const response = await fetch(link, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
        },
        body: JSON.stringify(newExpense),
      });

      const expense = await response.json();
      handleAdd(expense);
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

  const handleMonthChange = (event) => {
    setMonth(event.target.value);
  };

  const handleExpenseTypeChange = (event) => {
    setExpenseType(event.target.value);
  };

  const handleCurrencyChange = (event) => {
    setCurrency(event.target.value);
  };

  const togglePast = () => {
    setPast(!past);
  };

  return (
    <section>
      <div className="add-expense-container">
        <div className="dropdown">
          <label>Currency:</label>
          <select value={currency} onChange={handleCurrencyChange}>
            {currencies.map((currencyName) => (
              <option key={currencyName} value={currencyName}>
                {currencyName}
              </option>
            ))}
          </select>
        </div>

        <div className="dropdown">
          <label htmlFor="expense type">Expense Type:</label>
          <select value={expenseType} onChange={handleExpenseTypeChange}>
            {expenseTypes.map((expenseTypeName) => (
              <option key={expenseTypeName} value={expenseTypeName}>
                {expenseTypeName}
              </option>
            ))}
          </select>
        </div>
        <div className="dropdown">
          <label htmlFor="amount">Amount: </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div className="dropdown">
          <label htmlFor="description">Description: </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {past && (
          <>
            <div className={"dropdown"}>
              <label htmlFor="month">Month: </label>
              <select value={month} onChange={handleMonthChange}>
                {Object.keys(MonthMap).map((monthName) => (
                  <option key={monthName} value={monthName}>
                    {monthName}
                  </option>
                ))}
              </select>
            </div>
            <div className={"dropdown"}>
              <label htmlFor="year">Year: </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
              />
            </div>
          </>
        )}
      </div>
      <div className={"button-container"}>
        <button
          type="button"
          onClick={togglePast}
          className="add-expense-button"
        >
          {past ? "Add Preset Expenses" : "Add Past Expenses"}{" "}
          {past ? <FaToggleOn /> : <FaToggleOff />}{" "}
        </button>
        <button onClick={handleSubmit} className="add-expense-button">
          Add Expense <FaPlusCircle />
        </button>
      </div>
      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <h2>Form Errors</h2>
        {Object.keys(errors).map((key) => (
          <p key={key}>{errors[key]}</p>
        ))}
      </Modal>
    </section>
  );
};

export default AddExpense;
