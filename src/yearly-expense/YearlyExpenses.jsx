import MonthlyExpenses from "../monthly-expense/MonthlyExpenses.jsx";
import { useEffect } from "react";
import "./YearlyExpenses.css";

const YearlyExpenses = () => {
  useEffect(() => {
    console.log("YearlyExpenses component rendered ");
  });

  return (
    <div className={"yearly-expense-container"}>
      <header className="header">
        <h3>Monthly Expenses Tracker</h3>
      </header>

      <div className="content">
        <MonthlyExpenses />
      </div>
    </div>
  );
};

export default YearlyExpenses;
