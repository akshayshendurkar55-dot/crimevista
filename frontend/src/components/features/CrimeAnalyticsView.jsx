import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { BarChart2, TrendingUp, MapPin, Calendar, Clock, Layers } from 'lucide-react';
import { apiService } from '../../services/apiService';

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

export const CrimeAnalyticsView = () => {
  const [byType, setByType] = useState([]);
  const [byArea, setByArea] = useState([]);
  const [byMonth, setByMonth] = useState([]);
  const [byYear, setByYear] = useState([]);
  const [byDay, setByDay] = useState([]);
  const [byHour, setByHour] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const [typeData, areaData, monthData, yearData, dayData, hourData] = await Promise.all([
        apiService.get('/analytics/by-type'),
        apiService.get('/analytics/by-area'),
        apiService.get('/analytics/by-month'),
        apiService.get('/analytics/by-year'),
        apiService.get('/analytics/by-day'),
        apiService.get('/analytics/by-hour')
      ]);

      setByType(Array.isArray(typeData) ? typeData : []);
      setByArea(Array.isArray(areaData) ? areaData : []);
      setByMonth(Array.isArray(monthData) ? monthData : []);
      setByYear(Array.isArray(yearData) ? yearData : []);
      setByDay(Array.isArray(dayData) ? dayData : []);
      setByHour(Array.isArray(hourData) ? hourData : []);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-state">Loading Crime Analytics & Visualizations...</div>;
  }

  return (
    <div className="analytics-view-container">
      {/* Row 1: Crime Trend by Month & Crime Categories */}
      <div className="charts-grid-two">
        <div className="section-card chart-card">
          <div className="sc-header">
            <TrendingUp size={20} className="text-sky-400" />
            <h3>Monthly Crime Trend Analysis</h3>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={byMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="count" stroke="#38bdf8" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="section-card chart-card">
          <div className="sc-header">
            <BarChart2 size={20} className="text-purple-400" />
            <h3>Crime Distribution by Category</h3>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={byType}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {byType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Crime Distribution by Area & Yearly Comparison */}
      <div className="charts-grid-two">
        <div className="section-card chart-card">
          <div className="sc-header">
            <MapPin size={20} className="text-rose-400" />
            <h3>Crime Frequency by Area / Zone</h3>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byArea.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="area" type="category" width={110} stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#f43f5e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="section-card chart-card">
          <div className="sc-header">
            <Calendar size={20} className="text-amber-400" />
            <h3>Yearly Crime Comparison</h3>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byYear}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="year" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Day of Week & Hourly Pattern */}
      <div className="charts-grid-two">
        <div className="section-card chart-card">
          <div className="sc-header">
            <Clock size={20} className="text-emerald-400" />
            <h3>Crime Pattern by Day of Week</h3>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="section-card chart-card">
          <div className="sc-header">
            <Clock size={20} className="text-purple-400" />
            <h3>Crime Frequency by Hour of Day</h3>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={byHour}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="hour" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="count" stroke="#a855f7" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
