const Product = require("../models/Product");
const Expense = require("../models/Expense");
const Sale = require("../models/Sale");

const getDashboard = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const products = await Product.find();
    const expenses = await Expense.find({ date: { $gte: thirtyDaysAgo } });
    const sales = await Sale.find({ createdAt: { $gte: thirtyDaysAgo } });

    const todaySales = sales
      .filter((sale) => new Date(sale.createdAt) >= today)
      .reduce((sum, sale) => sum + sale.grandTotal, 0);
    const monthlySales = sales
      .filter((sale) => new Date(sale.createdAt) >= startOfMonth)
      .reduce((sum, sale) => sum + sale.grandTotal, 0);
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.grandTotal, 0);
    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );
    const estimatedProfit = totalRevenue - totalExpenses;
    const totalProducts = products.length;
    const lowStockProducts = products
      .filter((product) => product.quantity <= 10)
      .slice(0, 5);
    const recentSales = sales.slice(0, 5);

    const salesChart = [
      { label: "Week 1", value: 0 },
      { label: "Week 2", value: 0 },
      { label: "Week 3", value: 0 },
      { label: "Week 4", value: 0 },
    ];

    res.json({
      success: true,
      data: {
        todaySales,
        monthlySales,
        totalRevenue,
        totalExpenses,
        estimatedProfit,
        totalProducts,
        lowStockProducts,
        recentSales,
        salesChart,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard };
