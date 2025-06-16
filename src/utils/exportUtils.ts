import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Phase, PerformanceMetrics } from '../types/Phase';
import { formatCurrency, formatPercent } from './formatters';

export class ExportManager {
  static exportToCSV(phases: Phase[]): void {
    const allTrades = phases.flatMap(phase => 
      phase.levels.map(level => ({
        Phase: phase.phaseNumber,
        Level: level.levelNumber,
        Date: level.date,
        Balance: level.balance,
        'Risk %': level.riskPercent,
        'Lot Size': level.lotSize,
        'Pips to Risk': level.pipsToRisk,
        'R:R': level.rewardMultiple,
        'Profit Target': level.profitTarget,
        'P/L': level.pl,
        Completed: level.completed ? 'Yes' : 'No',
        Notes: level.notes || '',
        Strategy: level.strategy || '',
        'Currency Pair': level.currencyPair || '',
        'Market Session': level.marketSession || '',
      }))
    );

    const headers = Object.keys(allTrades[0] || {});
    const csvContent = [
      headers.join(','),
      ...allTrades.map(trade => 
        headers.map(header => {
          const value = trade[header as keyof typeof trade];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `trading-data-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  static async exportToPDF(
    phases: Phase[], 
    metrics: PerformanceMetrics,
    elementId?: string
  ): Promise<void> {
    const pdf = new jsPDF();
    
    // Add title
    pdf.setFontSize(20);
    pdf.text('Trading Performance Report', 20, 30);
    
    // Add date
    pdf.setFontSize(12);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 45);
    
    // Add performance metrics
    pdf.setFontSize(14);
    pdf.text('Performance Summary', 20, 65);
    
    pdf.setFontSize(10);
    const metricsText = [
      `Total Trades: ${metrics.totalTrades}`,
      `Win Rate: ${formatPercent(metrics.winRate)}`,
      `Total P/L: ${formatCurrency(metrics.totalProfitLoss)}`,
      `Profit Factor: ${metrics.profitFactor.toFixed(2)}`,
      `Max Drawdown: ${formatCurrency(metrics.maxDrawdown)}`,
      `Best Trade: ${formatCurrency(metrics.bestTrade)}`,
      `Worst Trade: ${formatCurrency(metrics.worstTrade)}`,
      `Average Risk: ${formatPercent(metrics.averageRiskPercent)}`,
    ];
    
    metricsText.forEach((text, index) => {
      pdf.text(text, 20, 80 + (index * 8));
    });

    // Add phase summary
    pdf.setFontSize(14);
    pdf.text('Phase Summary', 20, 160);
    
    pdf.setFontSize(10);
    phases.forEach((phase, index) => {
      const completedTrades = phase.levels.filter(l => l.completed).length;
      const phasePL = phase.levels.reduce((sum, l) => sum + (l.completed ? l.pl : 0), 0);
      
      pdf.text(
        `Phase ${phase.phaseNumber}: ${completedTrades}/${phase.levels.length} trades, P/L: ${formatCurrency(phasePL)}`,
        20,
        175 + (index * 8)
      );
    });

    // If element ID provided, capture screenshot
    if (elementId) {
      const element = document.getElementById(elementId);
      if (element) {
        try {
          const canvas = await html2canvas(element);
          const imgData = canvas.toDataURL('image/png');
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 10, 10, 190, 0);
        } catch (error) {
          console.error('Error capturing screenshot:', error);
        }
      }
    }

    pdf.save(`trading-report-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  static exportPhaseToJSON(phase: Phase): void {
    const blob = new Blob([JSON.stringify(phase, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `phase-${phase.phaseNumber}-${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}