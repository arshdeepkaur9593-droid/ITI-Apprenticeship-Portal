import Application from "../models/Application.js";
import Job from "../models/Job.js";
import Student from "../models/Student.js";
import User from "../models/User.js";

const MONTH_COUNT = 6;
const GROWTH_PERIOD_MONTHS = 3;
const LOCATION_LIMIT = 10;

const getMonthKey = (date) =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;

const getMonthStarts = (now) => {
  return Array.from({ length: MONTH_COUNT }, (_, index) => {
    return new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth() + index - MONTH_COUNT + 1,
        1
      )
    );
  });
};

const growthPercent = (monthlyActivity, metric, earliestRecord, firstMonth) => {
  if (!earliestRecord || earliestRecord > firstMonth) return null;

  const previousTotal = monthlyActivity
    .slice(0, GROWTH_PERIOD_MONTHS)
    .reduce((total, month) => total + month[metric], 0);
  const recentTotal = monthlyActivity
    .slice(GROWTH_PERIOD_MONTHS)
    .reduce((total, month) => total + month[metric], 0);

  if (previousTotal === 0) return null;
  return Math.round(((recentTotal - previousTotal) / previousTotal) * 1000) / 10;
};

const getLocationKey = (place, state) =>
  `${place.trim().toLocaleLowerCase("en-US")}|${state.trim().toLocaleLowerCase("en-US")}`;

export const getPortalAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const monthStarts = getMonthStarts(now);
    const firstMonth = monthStarts[0];
    const [
      userTotals,
      totalJobs,
      totalApplications,
      usersByMonth,
      applicationsByMonth,
      jobsByMonth,
      earliestStudent,
      earliestEmployer,
      earliestApplication,
      applicationStatusGroups,
      jobsByTradeGroups,
      studentsByLocation,
      jobsByLocation,
    ] = await Promise.all([
      User.aggregate([
        { $match: { role: { $in: ["student", "employer"] } } },
        { $group: { _id: "$role", count: { $sum: 1 } } },
      ]),
      Job.countDocuments(),
      Application.countDocuments(),
      User.aggregate([
        {
          $match: {
            role: { $in: ["student", "employer"] },
            createdAt: { $gte: firstMonth },
          },
        },
        {
          $group: {
            _id: {
              role: "$role",
              month: {
                $dateToString: {
                  format: "%Y-%m",
                  date: "$createdAt",
                  timezone: "UTC",
                },
              },
            },
            count: { $sum: 1 },
          },
        },
      ]),
      Application.aggregate([
        { $match: { createdAt: { $gte: firstMonth } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m",
                date: "$createdAt",
                timezone: "UTC",
              },
            },
            count: { $sum: 1 },
          },
        },
      ]),
      Job.aggregate([
        { $match: { createdAt: { $gte: firstMonth } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m",
                date: "$createdAt",
                timezone: "UTC",
              },
            },
            count: { $sum: 1 },
          },
        },
      ]),
      User.findOne({ role: "student" }).sort({ createdAt: 1 }).select("createdAt").lean(),
      User.findOne({ role: "employer" }).sort({ createdAt: 1 }).select("createdAt").lean(),
      Application.findOne().sort({ createdAt: 1 }).select("createdAt").lean(),
      Application.aggregate([
        {
          $group: {
            _id: { $ifNull: ["$status", "Unknown"] },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Job.aggregate([
        {
          $lookup: {
            from: Application.collection.name,
            let: { jobId: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$job", "$$jobId"] } } },
              { $count: "count" },
            ],
            as: "applicationCounts",
          },
        },
        {
          $group: {
            _id: { $ifNull: ["$trade", "Unspecified"] },
            jobs: { $sum: 1 },
            applications: {
              $sum: {
                $ifNull: [
                  { $arrayElemAt: ["$applicationCounts.count", 0] },
                  0,
                ],
              },
            },
          },
        },
        { $sort: { jobs: -1, _id: 1 } },
      ]),
      Student.aggregate([
        {
          $group: {
            _id: {
              place: {
                $cond: [
                  { $ne: [{ $ifNull: ["$city", ""] }, ""] },
                  { $trim: { input: "$city" } },
                  "Not specified",
                ],
              },
              state: {
                $cond: [
                  { $ne: [{ $ifNull: ["$state", ""] }, ""] },
                  { $trim: { input: "$state" } },
                  "Not specified",
                ],
              },
            },
            students: { $sum: 1 },
          },
        },
      ]),
      Job.aggregate([
        {
          $group: {
            _id: {
              place: {
                $cond: [
                  { $ne: [{ $ifNull: ["$location", ""] }, ""] },
                  { $trim: { input: "$location" } },
                  "Not specified",
                ],
              },
              state: {
                $cond: [
                  { $ne: [{ $ifNull: ["$state", ""] }, ""] },
                  { $trim: { input: "$state" } },
                  "Not specified",
                ],
              },
            },
            jobs: { $sum: 1 },
          },
        },
      ]),
    ]);

    const userCountByRole = new Map(
      userTotals.map(({ _id, count }) => [_id, count])
    );
    const monthlyActivity = monthStarts.map((month) => ({
      key: getMonthKey(month),
      month: month.toLocaleString("en-US", {
        month: "short",
        timeZone: "UTC",
      }),
      year: month.getUTCFullYear(),
      students: 0,
      employers: 0,
      applications: 0,
      jobs: 0,
    }));
    const monthIndex = new Map(
      monthlyActivity.map((month, index) => [month.key, index])
    );

    for (const { _id, count } of usersByMonth) {
      const index = monthIndex.get(_id.month);
      if (index !== undefined) {
        monthlyActivity[index][_id.role === "student" ? "students" : "employers"] =
          count;
      }
    }
    for (const { _id, count } of applicationsByMonth) {
      const index = monthIndex.get(_id);
      if (index !== undefined) monthlyActivity[index].applications = count;
    }
    for (const { _id, count } of jobsByMonth) {
      const index = monthIndex.get(_id);
      if (index !== undefined) monthlyActivity[index].jobs = count;
    }

    const applicationStatusCounts = new Map(
      applicationStatusGroups.map(({ _id, count }) => [String(_id), count])
    );
    const supportedStatuses =
      Application.schema.path("status")?.enumValues || [];
    const applicationStatuses = [
      ...new Set([
        ...supportedStatuses,
        ...applicationStatusCounts.keys(),
      ]),
    ]
      .sort((left, right) => left.localeCompare(right))
      .map((status) => ({
        status,
        count: applicationStatusCounts.get(status) || 0,
      }));

    const jobsByTrade = jobsByTradeGroups.map(({ _id, jobs, applications }) => ({
      trade: _id,
      jobs,
      applications,
    }));

    const locationsByKey = new Map();
    for (const { _id, students = 0 } of studentsByLocation) {
      const key = getLocationKey(_id.place, _id.state);
      locationsByKey.set(key, {
        key,
        place: _id.place,
        state: _id.state,
        students,
        jobs: 0,
      });
    }
    for (const { _id, jobs = 0 } of jobsByLocation) {
      const key = getLocationKey(_id.place, _id.state);
      const location = locationsByKey.get(key) || {
        key,
        place: _id.place,
        state: _id.state,
        students: 0,
        jobs: 0,
      };
      location.jobs = jobs;
      locationsByKey.set(key, location);
    }

    const locations = [...locationsByKey.values()]
      .sort(
        (left, right) =>
          right.students + right.jobs - (left.students + left.jobs) ||
          left.place.localeCompare(right.place)
      )
      .slice(0, LOCATION_LIMIT)
      .map(({ key, place, state, students, jobs }) => ({
        key,
        location:
          state === "Not specified" ? place : `${place}, ${state}`,
        students,
        jobs,
      }));

    return res.status(200).json({
      success: true,
      analytics: {
        generatedAt: now.toISOString(),
        metrics: {
          registeredStudents: userCountByRole.get("student") || 0,
          employers: userCountByRole.get("employer") || 0,
          totalJobs,
          totalApplications,
          successfulPlacements: null,
          placementsTracked: false,
        },
        growth: {
          comparison: "Most recent 3 months vs preceding 3 months",
          students: growthPercent(
            monthlyActivity,
            "students",
            earliestStudent?.createdAt,
            firstMonth
          ),
          employers: growthPercent(
            monthlyActivity,
            "employers",
            earliestEmployer?.createdAt,
            firstMonth
          ),
          applications: growthPercent(
            monthlyActivity,
            "applications",
            earliestApplication?.createdAt,
            firstMonth
          ),
        },
        monthlyActivity,
        applicationStatuses,
        jobsByTrade,
        locations,
      },
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to load portal analytics",
    });
  }
};
