import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import YearlyExpenses from "./yearly-expense/YearlyExpenses.jsx";
import AddExpense from "./monthly-expense/AddExpense.jsx";

const App = () => {
  return (
    <Router>
      <main>
        <Routes>
          <Route path="/" element={<YearlyExpenses />} />
        </Routes>
      </main>
    </Router>
  );
};

export default App;
