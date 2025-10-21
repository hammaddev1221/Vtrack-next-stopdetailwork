import React, { useRef, useEffect } from 'react';
import { Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, TimeScale } from 'chart.js';
import 'chartjs-adapter-date-fns';

// Register Chart.js components
Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, TimeScale);

const FuelChart = ({ data }:any) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current && data.length > 0) {

      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');

    const labels = data.map((item: { dateTime: any; }) => item.dateTime);
    const fuelValues = data.map((item: { fuel: any; }) => item.fuel);
    const addresses = data.map((item: { address: any; }) => item.address);

    
   const isFuelinLtr = data.some((item: { isFuelinLtr: boolean; }) => item.isFuelinLtr === true);

// 🔁 REVERSED display logic:
const unitLabel = isFuelinLtr ? 'Fuel Level (L)' : 'Fuel Level (%)';
const tooltipUnit = isFuelinLtr ? 'L' : '%';


    const minFuel = Math.min(...fuelValues);
    const maxFuel = Math.max(...fuelValues);
    const padding = Math.max(2, (maxFuel - minFuel) * 0.2);

  chartInstance.current = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: unitLabel,
          data: fuelValues,
          borderColor: 'rgb(0,181,108)',
          backgroundColor: 'rgba(0,181,108, 0.1)',
          tension: 0.1,
          pointBackgroundColor: 'rgb(0,181,108)',
          pointRadius: 5,
          pointHoverRadius: 7,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: unitLabel,
              font: {
                weight: 'bold'
              }
            },
            min: Math.max(0, minFuel - padding),
            max: isFuelinLtr ? Math.min(100, maxFuel + padding) : maxFuel + padding,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            type: 'time',
            time: {
              parser: 'dd MMM hh:mm:ss a',
              tooltipFormat: 'PPpp',
              displayFormats: {
                hour: 'MMM d, h a',
                day: 'MMM d',
                week: 'MMM d',
                month: 'MMM yyyy'
              }
            },
            title: {
              display: true,
              text: 'Date & Time',
              font: {
                weight: 'bold'
              }
            },
            grid: {
              display: false
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              title: function (context) {
                return `Fuel: ${context[0].raw}${tooltipUnit}`;
              },
              label: function (context) {
                return new Date(context.label).toLocaleString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });
              },
              afterLabel: function (context) {
                const index = context.dataIndex;
                return `Location: ${addresses[index]}`;
              }
            }
          },
          legend: {
            position: 'top',
            labels: {
              font: {
                size: 14
              },
              padding: 20
            }
          },
          title: {
            display: true,
            text: 'Fuel Level Monitoring',
            font: {
              size: 20,
              weight: 'bold'
            },
            padding: {
              top: 10,
              bottom: 10
            }
          }
        }
      }
    });
  }

  return () => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
  };
}, [data]);




  return (
    <div style={{ 
      width: '100%', 
      height: '70vh',
      padding: '10px',
      paddingBottom:"0px",
      boxSizing: 'border-box',
      backgroundColor: '#f9f9f9'
    }}>
      <canvas ref={chartRef} />
    </div>
  );
};
export default FuelChart

