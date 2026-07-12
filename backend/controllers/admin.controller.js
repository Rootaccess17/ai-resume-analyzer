const User = require('../models/User');
const Resume = require('../models/Resume');

const getAdminDashboardData = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    const allResumes = await Resume.find({}).populate('userId', 'name email').sort({ createdAt: -1 });

    const avgScore = allResumes.length
      ? Math.round(allResumes.reduce((sum, r) => sum + r.atsScore, 0) / allResumes.length)
      : 0;

    res.json({
      totalUsers: users.length,
      totalScans: allResumes.length,
      avgScore,
      users,
      allResumes,
    });
  } catch (error) {
    res.status(500).json({ message: 'Admin data fetch failed', error: error.message });
  }
};

module.exports = { getAdminDashboardData };