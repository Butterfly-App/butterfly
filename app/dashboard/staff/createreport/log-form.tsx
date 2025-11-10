"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {jsPDF} from 'jspdf';

type LogFormProps = {
  logs: Record<string, any>[]; 
  clientName?: string; 
  clientID?: string | null;
};

export default function LogForm({ logs, clientName, clientID}: LogFormProps) {
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [generatedReport, setGeneratedReport] = useState<string>("");
  const [showReport, setShowReport] = useState(false);

  // Format the log title from creator and created_at
  const formatLogTitle = (log: Record<string, any>) => {
    const date = new Date(log.created_at);
    const formattedDate = date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${log.name} - ${formattedDate}`;
  };

  // Format log content excluding title fields
  const formatLogContent = (log: Record<string, any>) => {
    const excludedFields = ['creator', 'author_id','created_at', 'client_id', 'id', 'user_id'];
    
    return Object.entries(log)
      .filter(([key]) => !excludedFields.includes(key))
      .map(([key, value]) => {
        // Format key: convert snake_case to Title Case
        const formattedKey = key
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        // Check if value is empty
        const isEmpty = value === null || value === undefined || value === '';
        
        // Display empty message for specific fields
        const displayValue = isEmpty
          ? 'None'
          : isEmpty
          ? null
          : value;
        
        return { key: formattedKey, value: displayValue, originalKey: key };
      })
  };

  const handleLogSelect = (logTitle: string) => {
    setSelectedLogs(prev => {
      if (prev.includes(logTitle)) {
        return prev.filter(title => title !== logTitle);
      } else {
        return [...prev, logTitle];
      }
    });
  };

  const toggleExpand = (logKey: string) => {
    setExpandedLog(expandedLog === logKey ? null : logKey);
  };

  const generateReport = async () => {
    // Find the selected log objects
    const selectedLogObjects = logs.filter((log, index) => {
      const title = formatLogTitle(log);
      return selectedLogs.includes(title);
    });

    // Build the report text
    let reportText = "";
    
    selectedLogObjects.forEach((log, index) => {
      const title = formatLogTitle(log);
      const content = formatLogContent(log);
      
      // Add log title
      reportText += `${title}\n\n`;
      
      // Add each field with its label
      content.forEach(({ key, value }) => {
        reportText += `${key}\n${value}\n\n`;
      });
      
      // Add separator between logs (except after the last one)
      if (index < selectedLogObjects.length - 1) {
        reportText += "---\n\n";
      }
    });

    setGeneratedReport(reportText);
    setShowReport(true);

    const supabase = createClient();
    const pdfBlob = await generatePDFBlob(reportText); // Generate PDF from report
    
    const today = new Date();
    const dateString = today.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-');

    const cleanClientName = clientName?.replace(/\s+/g, '_').toLowerCase() || 'client';
    const filename = `${cleanClientName}_${dateString}`;
    
    const { data: uploadData, error:uploadError } = await supabase.storage
      .from('reports')
      .upload(`${filename}.pdf`, pdfBlob, {
        contentType: 'application/pdf',
        upsert : true
      });
      
    if (uploadError) {
      console.error('Upload error:', uploadError);
      alert('Report failed to upload');
    } else {
      console.log('Upload success:', uploadError);
      alert('Report generated and uploaded successfully!');
    }

    if (uploadError || !uploadData) {
      console.error('Storage upload error:', uploadError?.message || 'Upload data is null');
      return; // Stop execution if upload fails
   }

    const { data: publicURLData } = supabase.storage
      .from('reports')
      .getPublicUrl(uploadData.path);

    if (!publicURLData) {
      console.error('Could not generate public URL.');
      return;
    }

    const documentUrl = publicURLData.publicUrl;

    const { data:addReport, error:addReportError } = await supabase
      .from('reports')
      .insert([
        { 
          client_id: clientID,
          title: filename,
          document_url: documentUrl,
          content: reportText
        },
      ])

    if (addReportError) {
      console.error('reports table insert error:', addReportError);
    }
    
  };

  const generatePDFBlob = async (reportText: string): Promise<Blob> => {
    const doc = new jsPDF();
    const reportTitle = `${clientName}'s Report - ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`;
    
    // Add content to PDF
    doc.setFontSize(16);
    doc.text(reportTitle, 10, 10);
    
    // Add the report text
    const lines = doc.splitTextToSize(reportText, 180); 
    doc.text(lines, 10, 20);
    
    // Return as blob
    return doc.output('blob');
  };

  const copyReportToClipboard = () => {
    navigator.clipboard.writeText(generatedReport);
  };

  const exportToPDF = () => {
    // Create a new window with the report content
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const reportTitle = `${clientName}'s Report - ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`;

    // Write HTML content to the new window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Chrysalis</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
              line-height: 1.6;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            .log-section {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            .log-title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 15px;
              color: #2563eb;
            }
            .field-label {
              font-weight: bold;
              margin-top: 10px;
              margin-bottom: 5px;
              color: #374151;
            }
            .field-value {
              margin-bottom: 15px;
              white-space: pre-wrap;
            }
            .separator {
              border-top: 1px solid #d1d5db;
              margin: 30px 0;
            }
            @media print {
              body {
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          <h1>${reportTitle}</h1>
          ${formatReportForPDF()}
        </body>
      </html>
    `);

    printWindow.document.close();
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const formatReportForPDF = () => {
    const selectedLogObjects = logs.filter((log) => {
      const title = formatLogTitle(log);
      return selectedLogs.includes(title);
    });

    let html = '';
    
    selectedLogObjects.forEach((log, index) => {
      const title = formatLogTitle(log);
      const content = formatLogContent(log);
      
      html += '<div class="log-section">';
      html += `<div class="log-title">${title}</div>`;
      
      content.forEach(({ key, value }) => {
        html += `<div class="field-label">${key}</div>`;
        html += `<div class="field-value">${String(value).replace(/\n/g, '<br>')}</div>`;
      });
      
      html += '</div>';
      
      if (index < selectedLogObjects.length - 1) {
        html += '<div class="separator"></div>';
      }
    });

    return html;
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4">Log List</h2>
      <div className="space-y-2">
        {(!logs || logs.length === 0) && (
          <p className="text-sm text-red-600">No logs found for this client.</p>
        )}

        {logs?.map((log, index) => {
          const title = formatLogTitle(log);
          const uniqueKey = `${log.creator}-${log.created_at}-${index}`;
          const logContent = formatLogContent(log);
          const isExpanded = expandedLog === uniqueKey;
          
          return (
            <div key={uniqueKey} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={uniqueKey}
                  name="log"
                  value={title}
                  checked={selectedLogs.includes(title)}
                  onChange={() => handleLogSelect(title)}
                  className="h-4 w-4 text-blue-600"
                />
                <label
                  htmlFor={uniqueKey}
                  className="text-zinc-600 dark:text-zinc-400 cursor-pointer flex-1 font-medium"
                >
                  {title}
                </label>
                <button
                  type="button"
                  onClick={() => toggleExpand(uniqueKey)}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                  {isExpanded ? 'Hide' : 'Show'} Details
                </button>
              </div>
              
              {isExpanded && logContent.length > 0 && (
                <div className="ml-6 mt-2 space-y-2 text-sm">
                  {logContent.map(({ key, value }) => (
                    <div key={key} className="space-y-1">
                      <h4 className="font-semibold text-zinc-700 dark:text-zinc-300">
                        {key}
                      </h4>
                      <p className="text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                        {String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              
              {isExpanded && logContent.length === 0 && (
                <p className="ml-6 text-sm text-zinc-500 italic">No additional content</p>
              )}
            </div>
          );
        })}
      </div>
      {selectedLogs.length > 0 && (
        <div className="mt-4 space-y-3">
          <p className="text-sm font-medium">
            Selected logs: {selectedLogs.length}
          </p>
          <div className="flex gap-2">
            <Button 
              onClick={generateReport}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Generate Report
            </Button>
            {showReport && (
              <>
                <Button 
                  onClick={copyReportToClipboard}
                  variant="outline"
                >
                  Copy to Clipboard
                </Button>
                <Button 
                  onClick={exportToPDF}
                  variant="outline"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Export as PDF
                </Button>
              </>
            )}
          </div>
        </div>
      )}
      
      {showReport && generatedReport && (
        <div className="mt-6 p-4 border rounded-lg bg-zinc-50 dark:bg-zinc-900">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-lg">
              {clientName}'s Report - {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            <Button 
              onClick={() => setShowReport(false)}
              variant="ghost"
              size="sm"
            >
              Hide
            </Button>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300 font-mono">
            {generatedReport}
          </pre>
        </div>
      )}
    </div>
  );
}