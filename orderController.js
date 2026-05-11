// Admin daily report
getDailyReport: async (req, res) => {
  try {
    const report = await OrderModel.getDailyReport();
    res.json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
},