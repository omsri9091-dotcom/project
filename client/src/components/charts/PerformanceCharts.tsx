import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
  LineChart,
  Line,
} from 'recharts';

interface PerformancePieProps {
  data: Array<{ name: string; count: number; color?: string }>;
}

export const PerformancePieChart: React.FC<PerformancePieProps> = ({ data }) => {
  const defaultColors = ['#f43f5e', '#f59e0b', '#3b82f6', '#10b981'];

  const chartData = data.map((item, idx) => ({
    ...item,
    color: item.color || defaultColors[idx % defaultColors.length],
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={4}
            dataKey="count"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="#0d1527" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#0d1527',
              borderColor: '#1f2e4d',
              borderRadius: '12px',
              color: '#f8fafc',
              fontSize: '12px',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-xs text-slate-300">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

interface RiskBarProps {
  data: Array<{ name: string; value: number; color?: string }>;
}

export const RiskBarChart: React.FC<RiskBarProps> = ({ data }) => {
  const chartData = data.map((d) => ({
    ...d,
    fill: d.name.includes('High')
      ? '#ef4444'
      : d.name.includes('Medium')
      ? '#f59e0b'
      : '#10b981',
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2e4d" opacity={0.5} />
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
          <YAxis stroke="#94a3b8" fontSize={11} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0d1527',
              borderColor: '#1f2e4d',
              borderRadius: '12px',
              color: '#f8fafc',
              fontSize: '12px',
            }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`bar-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

interface ScatterProps {
  data: Array<any>;
}

export const AttendanceGpaScatter: React.FC<ScatterProps> = ({ data }) => {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2e4d" opacity={0.5} />
          <XAxis
            type="number"
            dataKey="attendance"
            name="Attendance"
            unit="%"
            stroke="#94a3b8"
            fontSize={11}
            domain={[40, 100]}
          />
          <YAxis
            type="number"
            dataKey="performanceScore"
            name="Performance Index"
            unit="pts"
            stroke="#94a3b8"
            fontSize={11}
            domain={[30, 100]}
          />
          <ZAxis type="number" dataKey="gpa" range={[50, 150]} name="GPA" />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{
              backgroundColor: '#0d1527',
              borderColor: '#1f2e4d',
              borderRadius: '12px',
              color: '#f8fafc',
              fontSize: '12px',
            }}
            formatter={(value: any, name: string) => [value, name]}
          />
          <Scatter name="Students" data={data} fill="#6366f1" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

interface SemesterTrendProps {
  data: Array<{ semester: string; avgScore: number; highRiskStudents?: number; attendance?: number }>;
}

export const SemesterTrendLine: React.FC<SemesterTrendProps> = ({ data }) => {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2e4d" opacity={0.5} />
          <XAxis dataKey="semester" stroke="#94a3b8" fontSize={11} />
          <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0d1527',
              borderColor: '#1f2e4d',
              borderRadius: '12px',
              color: '#f8fafc',
              fontSize: '12px',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-xs text-slate-300">{value}</span>}
          />
          <Line
            type="monotone"
            dataKey="avgScore"
            name="Avg Performance Score"
            stroke="#6366f1"
            strokeWidth={3}
            dot={{ fill: '#6366f1', r: 4 }}
            activeDot={{ r: 6 }}
          />
          {data[0]?.highRiskStudents !== undefined && (
            <Line
              type="monotone"
              dataKey="highRiskStudents"
              name="High Risk Count"
              stroke="#f43f5e"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ fill: '#f43f5e', r: 3 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
