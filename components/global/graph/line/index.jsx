// components/LineChart.js
import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  scales,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  scales
);

ChartJS.defaults.borderColor = "rgba(255,255,255,0.15)";
ChartJS.defaults.color = "rgba(255,255,255,0.7)";
ChartJS.defaults.font.size = 13;
ChartJS.defaults.transitions.duration = 1000;


const LineChart = (chartDetails) => {
  const chartData = {
    labels: ['O', ...chartDetails.chartDetails.chartLabels],
    datasets: [
      {
        // First dataset
        data: [0, ...chartDetails.chartDetails.values],
        label: "Percentage",
        borderColor: "#9747FF",
        borderWidth: 2,
        backgroundColor: "rgba(151, 71, 255, 0.6)",
        fill: false,
        tension: 0,
        pointStyle: "circle",
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: "rgba(255,255,255,0.4)",
        segment: {
          borderColor: (context) => {
            const index = context.p0.parsed.x;
            return index == 0 ? "rgba(255,255,255,0.1)" : "#9747FF";
          },
          borderDash: (context) => {
            const index = context.p0.parsed.x;
            return index == 0 ? [5, 5] : [0, 0];
          },
        }
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
        position: "top",
      },
      title: {
        display: false,
        text: "Marks Percentage",
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default LineChart;
